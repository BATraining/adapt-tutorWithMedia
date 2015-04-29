/*
 * adapt-tutor-withMedia
 * License - http://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
 * Maintainers - Kevin Corry <kevinc@learningpool.com>, Daryl Hedley <darylhedley@hotmail.com>,
 *              Himanshu Rajotia <himanshu.rajotia@exultcorp.com>,
                Faisal Patel <shahfaisal.patel@exultcorp.com>
 */
define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');
    var mep = require('extensions/adapt-tutor-withMedia/js/mediaelement-and-player.min');

    var TutorView = Backbone.View.extend({

        className: "extension-tutor-withMedia",

        initialize: function() {


            this.updateFeedback();


            if (this.model.get('_attemptsLeft') === 0 || this.model.get('_isCorrect')) {
                this.model.set('canShowMedia', true);
            } else {
                this.model.set('canShowMedia', false);
            }
            this.render();
            this.listenTo(Adapt, 'remove', this.closeTutor, this);
            this.listenTo(Adapt, 'device:resize', _.debounce(this.resetTutorSize, 100));
        },


        events: {
            'click .tutor-done': 'onTutorCloseClick',
            'click .tutor-icon': 'onTutorCloseClick'
        },

        render: function() {
            var data = this.model.toJSON();
            var template = Handlebars.templates["tutor-withMedia"];
            this.$el.html(template(data)).appendTo('#wrapper');
            this.$('.tutor').css({display: 'block', opacity: 0});

            if(this.model.get('canShowMedia') && this.model.get('_feedback')._graphic) {
                this.$('.tutor-graphic').imageready(_.bind(function() {
                    _.defer(_.bind(function() {
                        this.showTutor();
                        this.postRender();
                    }, this));
                }, this));
            } else {
                _.defer(_.bind(function() {
                    this.showTutor();
                    this.postRender();
                }, this));
            }

            return this;
        },

        postRender: function() {
            $(document).on('keyup', _.bind(this.onKeyUp, this));
            if (this.model.get('canShowMedia') && this.model.get('_feedback')._media) {
                this.setupPlayer();
            }
        },

        setupPlayer: function() {
            this.model.set('_playerOptions', {});
            var modelOptions = this.model.get('_playerOptions');
            modelOptions.pluginPath = 'assets/';
            modelOptions.features = ['playpause','progress','current','duration'];
            modelOptions.success = _.bind(this.onPlayerReady, this);

            this.$('video').mediaelementplayer(modelOptions);

            if (this.model.get('_feedback')._media.source) {
                this.$('.tutor-media').addClass('external-source');
            }
        },

        resetTutorSize: function() {
            this.$('.tutor').removeAttr('style');
            this.resizeTutor(true);
        },

        resizeTutor: function(noAnimation) {
            if (Adapt.device.screenSize == 'large') {
                this.$('.tutor-inner').removeClass('small-screen');
            } else {
                this.$('.tutor-inner').addClass('small-screen');
            }

            var feedback = this.model.get('_feedback');
            if (Adapt.device.screenSize == 'large' && this.model.get('canShowMedia') && (feedback._graphic || feedback._media)) {
                if(feedback._media) {
                    this.$('video').width(this.$('.tutor-media').width());
                }

                var mediaWidth = this.$('.media-container').width();
                var bodyWidth = this.$('.tutor-inner').width() - (this.$('.media-container').width() + 5);
                this.$('.tutor-body').width(bodyWidth);
            } else {
                this.$('.tutor-body').css('width', '100%');
            }

            var windowHeight = $(window).height();
            var tutorHeight = this.$('.tutor').height();
            var animationSpeed = 400;
            if (tutorHeight > (windowHeight - $('.navigation').height())) {
                this.$('.tutor').css({
                    'height': '100%',
                    'top': 0,
                    'overflow-y': 'scroll',
                    '-webkit-overflow-scrolling': 'touch',
                    'opacity': 1
                });
            } else {
                if (noAnimation) {
                    animationSpeed = 0;
                }
                this.$('.tutor').css({
                    'margin-top': -(tutorHeight / 2) - 50, 'opacity': 0
                }).velocity({
                    'margin-top': -(tutorHeight / 2), 'opacity': 1
                }, animationSpeed);
            }
        },

        showTutor: function() {
            this.$('.tutor').show();
            this.$('.tutor-shadow').fadeIn('slow', _.bind(function() {
                this.$el.a11y_focus();
            }, this));

            _.defer(_.bind(function() {
                this.resizeTutor();
            }, this));
        },

        closeTutor: function() {
            if (this.model.get('_feedback')._media && this.model.get('canShowMedia')) {
                if ($("html").is(".ie8")) {
                    var obj = this.$("object")[0];
                    obj.style.display = "none"
                }
                $(this.mediaElement.pluginElement).remove();
                delete this.mediaElement;
            }

            this.$el.fadeOut('fast', _.bind(function() {
                this.remove();
                Adapt.trigger('tutor:closed');
            }, this));
            Adapt.trigger('popup:closed');
        },

        onTutorCloseClick: function(event) {
            if (event && event.preventDefault) event.preventDefault();
            this.closeTutor();
        },

        onKeyUp: function(event) {
            var keyCode = event.keyCode ? event.keyCode : event.which;
            if (keyCode == 27) { // esc key
                this.closeTutor();
            }
        },

        onPlayerReady: function (mediaElement, domObject) {
            this.mediaElement = mediaElement;
        },

        updateFeedback:function(){
            var feedbackTitle, feedbackMessage;
            var feedback = this.model.get('_feedback');

            if (this.model.get('_isCorrect')) {
                feedbackTitle = this.model.get('_feedback').correct.title;
                feedbackMessage = this.model.get('_feedback').correct.body;
            } else {
                feedbackMessage = this.model.get('_feedback').body;
                if (this.model.get('_isAtLeastOneCorrectSelection')) {
                    if (this.model.get('_attemptsLeft') === 0 || !this.model.get('_feedback')._partlyCorrect.notFinal) {
                        feedbackTitle = this.model.get('_feedback')._partlyCorrect.final.title;
                    } else {
                        feedbackTitle = this.model.get('_feedback')._partlyCorrect.notFinal.title;
                        feedbackMessage = '';
                    }
                } else {
                    if (this.model.get('_attemptsLeft') === 0 || !this.model.get('_feedback')._incorrect.notFinal) {
                        feedbackTitle = this.model.get('_feedback')._incorrect.final.title;
                    } else {
                        feedbackTitle = this.model.get('_feedback')._incorrect.notFinal.title;
                        feedbackMessage = '';
                    }
                }
            }

            this.model.set({
                feedbackTitle: feedbackTitle,
                feedbackMessage: feedbackMessage
            });
        }

    });

    Adapt.on('questionView:showFeedback', function(view) {

        var tutor = new TutorView({
            model: view.model
        });

        Adapt.trigger('popup:opened', tutor.$el);

    });

});
