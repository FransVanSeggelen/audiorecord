var media;
var secondsRecorded = 0;
var maxSeconds = 5;
var interval;
var lastState;
var filename = 'myRecording.wav';
var uploadURL = 'http://shinefestival.herokuapp.com';

document.addEventListener('deviceready', function(){
    updateCurrentState('idle');
    updateSecondsRecordedUI();

    $('button').on('tap', function(e){
        switch ($(this).attr('id'))
        {
            case 'btnStart':
                startRecording();
                break;
            case 'btnStop':
                stopRecording();
                break;
            case 'btnPlay':
                playRecordedFile();
                break;
            case 'btnSend':
                sendRecordedFile();
                break;
        }
    });
});

function startRecording(){
    updateCurrentState('recording');
    media = createMedia();
    media.startRecord();
    interval = setInterval(function(){
        secondsRecorded++;
        updateSecondsRecordedUI();

        if(secondsRecorded >= maxSeconds){
            stopRecording();
        }
    }, 1000);
}

function createMedia(){
    return new Media(filename, 
        function(){
            if(lastState == 'playing'){
                updateCurrentState('recorded');
            }
        }, 
        function(err){
            alert(err.message); 
        }
    );
};

function updateSecondsRecordedUI(){
    var secondsLeft = maxSeconds - secondsRecorded;
    var text = (secondsLeft < 10 ? '0' : '') + secondsLeft;
    $('#textSecondsLeft').html('00:' + text);
}

function stopRecording(){
    if(interval){
        clearInterval(interval);
    }

    updateCurrentState('recorded');

    secondsRecorded = 0;
    updateSecondsRecordedUI();

    if(media){
        media.stopRecord();
        media.release();
        media = undefined;
    }
}

function playRecordedFile(){
    updateCurrentState('playing');
    media = createMedia();
    media.play();
}

function sendRecordedFile(){
    updateCurrentState('idle');
    $('#textSendStatus').html('uploading...');

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
        fileSystem.root.getFile(filename, { create: false, exclusive: false }, function(fileEntry){
            var options = new FileUploadOptions();
            options.fileKey = "recordedAudio";
            options.fileName = filename;
            options.mimeType = 'audio/mpeg';
            options.chunkedMode = false;

            var ft = new FileTransfer();
            ft.upload(fileEntry.toURL(), uploadURL, 
                function(res){
                    $('#textSendStatus').html('success!');
                }, function(err){
                    alert('oh no!');
                    $('#textSendStatus').html(err.body);
                }, options);
        });
    });

    
}

function updateCurrentState(status){
    lastState = status;
    switch (status){
        case 'idle':
            $('#btnStart').prop('disabled', false);
            $('#btnStop').prop('disabled', true);
            $('#btnPlay').prop('disabled', true);
            $('#btnSend').prop('disabled', true);
            break;
        case 'recorded':
            $('#btnStart').prop('disabled', false);
            $('#btnPlay').prop('disabled', false);
            $('#btnSend').prop('disabled', false);
            break;
        case 'recording':
            $('#btnStop').prop('disabled', false);
            $('#btnStart').prop('disabled', true);
            $('#btnSend').prop('disabled', true);
            break;
        case 'playing':
            $('#btnStart').prop('disabled', true);
            $('#btnPlay').prop('disabled', true);
            $('#btnSend').prop('disabled', true);
            break;
    }
}