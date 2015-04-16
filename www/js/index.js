var media;
var secondsRecorded = 0;
var maxSeconds = 5;
var interval;
var lastState;
var filename = 'ShineFestival';
var filemime = 'audio/'
var uploadURL = 'http://shinefestival.herokuapp.com';

document.addEventListener('deviceready', function(){

    var isMobile = {
        Android: function() { return navigator.userAgent.match(/Android/i); }, 
        BlackBerry: function() { return navigator.userAgent.match(/BlackBerry/i); }, 
        iOS: function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); }, 
        Opera: function() { return navigator.userAgent.match(/Opera Mini/i); }, 
        Windows: function() { return navigator.userAgent.match(/IEMobile/i); }, 
        any: function() { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); }
    };
    if (isMobile.Android()) {
        filename += '.amr';
        filemime += 'AMR'
    };
    if (isMobile.iOS()) {
        filename += '.wav';
        filemime += 'wav'
    };
    $('#textSendStatus').html(filename + ': ' + filemime);


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
alert('Net na uploading...');
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
alert('fileSystem= ' + fileSystem.root + '=' + fileSystem.name);
        for(var key in fileSystem){
            console.log('--' + key + '=' + fileSystem[key]);
        }
        fileSystem.root.getFile(filename, { create: false, exclusive: false }, function(fileEntry){
alert('Bij getFile...');
            var options = new FileUploadOptions();
            options.fileKey = "recordedAudio";
            options.fileName = filename;
            options.mimeType = filemime;
            options.chunkedMode = false;

alert('Net voor file transfer...');
            var ft = new FileTransfer();
            ft.upload(fileEntry.toURL(), uploadURL, 
                function(res){
                    $('#textSendStatus').html('success!');
                }, function(err){
                    alert('oh no!');
                    $('#textSendStatus').html(err.body);
                }, options);
        }, function(error){alert('Error getting the file: ' + error.code + '= ' + error.message)});
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