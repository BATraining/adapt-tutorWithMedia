#adapt-tutor-withMedia


An Adapt core contributed extension which is passed some feedback data and displays a basic overlay for question components with media.

##Installation

First, be sure to install the [Adapt Command Line Interface](https://github.com/adaptlearning/adapt-cli), then from the command line run:-

        adapt install adapt-tutor-withMedia

##Usage

Once installed, the tutor-withMedia extension can be used to provide a sliding drawer for the navigation bar.

To setup the navigation bar, add the ``_feedback`` attribute to an assessment component in components.json:

```
"_feedback": {
  "correct": {
    "title": "Correct",
    "body": ""
  },
  "_incorrect": {
    "notFinal": {
      "title": "Incorrect, Try Again",
      "body": ""
    },
    "final": {
      "title": "Incorrect",
      "body": ""
    }
  },
  "_partlyCorrect": {
    "notFinal": {
      "title": "Partially Correct, Try Again",
      "body": ""
    },
    "final": {
      "title": "Partially Correct",
      "body": ""
    }
  },
  "_default": {
    "title": "",
    "body": ""
  },
  "_graphic": {
    "src": "",
    "alt": ""
  }
}
```

##Settings overview

A complete example of this extension's settings can be found in the [example.json](https://github.com/BATraining/adapt-tutorWithMedia/blob/master/example.json) file.

### Data description

Further settings for this extension are:

####title

Specifies the title text of the feedback dialog.

####body

Specifies the body text of the feedback dialog.

####correct

Defines text to be displayed when the answer is correct.

####_partlyCorrect

Defines text to be displayed when the answer is partially correct.

####_incorrect

Defines text to be displayed when the answer is incorrect.

####final

Defines text to be displayed when all attempts have been used up.

####notFinal

Defines text to be displayed when there are still attempts to be used in answering the assessment.

####_default

Defines default text to be displayed when the ``title`` or ``body`` attributes are not declared.

####_graphic

Specifies the src of the graphic media to be displayed next to the feedback message once all attempts have been used.

####_media

Specifies the src of the video media to be displayed next to the feedback message once all attempts have been used.

##Limitations

N/A

##Browser spec

N/A
