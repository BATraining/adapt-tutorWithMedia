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

            _.defer(_.bind(function() {
                this.showTutor();
                this.postRender();
            }, this));

            return this;
        },

        postRender: function() {
            $(document).on('keyup', _.bind(this.onKeyUp, this));

            var feedback = this.model.get('_feedback');
            if (feedback._graphic || feedback._media) {
                this.$('.tutor-inner').addClass('have-media');

                if(feedback._media) {
                    this.setupPlayer();
                }
            } else {
                this.$('.tutor-inner').removeClass('have-media');
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
                this.$('.media-widget').addClass('external-source');
            }
        },

        resetTutorSize: function() {
            this.$('.tutor').removeAttr('style');
            this.resizeTutor(true);

            var feedback = this.model.get('_feedback');
            if(feedback._media) {
                this.$('video').width(this.$('.tutor-media').width());
            }

            if (Adapt.device.screenSize == 'large') {
                this.$('.tutor-inner').removeClass('small-screen');
            } else {
                this.$('.tutor-inner').addClass('small-screen');
            }
        },

        resizeTutor: function(noAnimation) {
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
            if (this.model.get('_feedback')._media) {
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
        }

    });

    Adapt.on('questionView:showFeedback', function(view) {

        var tutor = new TutorView({
            model: view.model
        });

        Adapt.trigger('popup:opened', tutor.$el);

    });

});
