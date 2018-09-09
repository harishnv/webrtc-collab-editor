$(document).ready(function() {
var mod_oper_running=false;
var connected_to_io=false;

  $('#button_connect').click(function(event) {
    /* Act on the event */
    if(!connected_to_io){
    username=$('#txt_uname').val();
    socket.emit('user_join', username);
    console.log("button clicked "+username);
    $('#connect_modal').modal("hide");
    }
  });

  /************* codemirror configuration ******************/

  var code = $("#codemirror-textarea")[0];
  var editor = CodeMirror.fromTextArea(code, {
    lineNumbers : true,
    mode: 'application/x-httpd-php'
  });
  editor.on("change", function(instance,obj){
    console.log(''+mod_oper_running);
    if(!mod_oper_running){
    var msg=new Object();
    msg.from=obj.from;
    msg.to=obj.to;
    if(obj.text.length==2){
      msg.text='\n';
    }else{
    msg.text=obj.text[0];
  }
    msg.data='string';
    sendText( JSON.stringify(msg));
    console.log(msg);
  }
    //console.log(obj.from);
});





    /*****************  Socket.io code *********************/
    var username;
    var socket = io.connect('http://127.0.0.1:3200');

socket.on('roomfull', function(room) {
  console.log('this room is full cant connect ' + room);
  // updateRoomURL(ipaddr);
 
});

socket.on('createdroom', function(room, clientId) {
  console.log('Created room', room);
  initiate = true;
   socketIoMsg(true,"socket.io Connected");
 // grabWebCamVideo();

});

socket.on('joinedroom', function(room, clientId) {
  console.log('This peer has joined room', room);
  initiate = false;
   socketIoMsg(true,"socket.io Connected");
  createpeer_connection(initiate, config);
//  grabWebCamVideo();
});



socket.on('ready', function() {
  console.log('Socket is ready');
  createpeer_connection(initiate, config);
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

socket.on('message', function(message) {
  console.log('Client received message:', message);
  signalMsgCb(message);
});

// Joining a room.
// socket.emit('create or join', room);

// if (location.hostname.match(/localhost|127\.0\.0/)) {
//   socket.emit('ipaddr');
// }

// Leaving rooms and disconnecting from peers.
socket.on('disconnect', function(reason) {
  console.log(`Disconnected: ${reason}.`);
   socketIoMsg(false,"Connect");

});

socket.on('bye', function(room) {
  console.log(`Peer leaving room ${room}.`);
 
});
/**
* Send message to signaling server
*/
function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

    /*******************************************************/


/****************************************************************************
* WebRTC peer connection and data channel
****************************************************************************/

var config = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  },{"url": "stun:23.21.150.121"}]
};

var peer_conn;
var dataChannel;

function signalMsgCb(message) {
  if (message.type === 'offer') {
    console.log('Got offer. Sending answer to peer.');
    peer_conn.setRemoteDescription(new RTCSessionDescription(message), function() {},
                                  logError);
    peer_conn.createAnswer(onSessionLocal, logError);

  } else if (message.type === 'answer') {
    console.log('Got answer.');
    peer_conn.setRemoteDescription(new RTCSessionDescription(message), function() {},
                                  logError);

  } else if (message.type === 'candidate') {
    peer_conn.addIceCandidate(new RTCIceCandidate({
      candidate: message.candidate
    }));

  }
}

function createpeer_connection(initiate, config) {
  console.log('Creating Peer connection as initiator?', initiate, 'config:',
              config);
  peer_conn = new RTCPeerConnection(config);

// send any ice candidates to the other peer
peer_conn.onicecandidate = function(event) {
  console.log('icecandidate event:', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
};

if (initiate) {
  console.log('Creating Data Channel');
  dataChannel = peer_conn.createDataChannel('char_data');
  onDataChannelCreated(dataChannel);

  console.log('Creating an offer');
  peer_conn.createOffer(onSessionLocal, logError);
} else {
  peer_conn.ondatachannel = function(event) {
    console.log('ondatachannel:', event.channel);
    dataChannel = event.channel;
    onDataChannelCreated(dataChannel);
  };
}
}

function onSessionLocal(desc) {
  console.log('local session created ', desc);
  peer_conn.setLocalDescription(desc, function() {
    console.log('sending local desc ', peer_conn.localDescription);
    sendMessage(peer_conn.localDescription);
  }, logError);
}

function onDataChannelCreated(channel) {
  console.log('onDataChannelCreated:', channel);

  channel.onopen = function() {
setWebRtcDispMsg("WebRTC Connected datachannel open")
    console.log('CHANNEL opened!!!');
   
  };

  channel.onclose = function () {
    setWebRtcDispMsg("WebRTC  datachannel closed")
    console.log('Channel closed.');
   
  }

  channel.onmessage = (adapter.browserDetails.browser === 'firefox') ?
  receiveDataFirefoxFactory() : receiveDataChromeFactory();
}

function receiveDataChromeFactory() {
  var buf, count;

  return function onmessage(event) {
    if (typeof event.data === 'string') {
      processMsg(event);
    //   mod_oper_running=true;
    //   var mod_to=new Object();
    //   var data=JSON.parse(event.data);
    //   mod_to=data.to;
    //   if(data.text===''){
    //     editor.replaceRange('',data.from,data.to);
    //   }else{
    // mod_to.ch=data.to.ch+1;
    //   var txt=editor.getRange(data.from, mod_to);
    //   if(txt!== data.text)
    //  editor.replaceRange(data.text,data.from,data.to);
    //  console.log('data: ' +  data);
    //  }
    //  mod_oper_running=false;
    //   return;
    }

    
    

};
}

function receiveDataFirefoxFactory() {
  var count, total, parts;

  return function onmessage(event) {
    if (typeof event.data === 'string') {
      processMsg(event);
      
    }
    
  };
}

/**
* Send message on webrtc datachannel 
*/
function sendText(txt) {
 dataChannel.send(txt);
}




function logError(err) {
  if (!err) return;
  if (typeof err === 'string') {
    console.warn(err);
  } else {
    console.warn(err.toString(), err);
  }
}


 function processMsg (event) {
  // body...
  mod_oper_running=true;
      var mod_to=new Object();
      var data=JSON.parse(event.data);
      mod_to=data.to;
      if(data.text===''){
        editor.replaceRange('',data.from,data.to);
      }else{
    mod_to.ch=data.to.ch+1;
      var txt=editor.getRange(data.from, mod_to);
      if(txt!== data.text)
     editor.replaceRange(data.text,data.from,data.to);
     console.log('data: ' +  data);
     }
     mod_oper_running=false;
     return;
} 


function setWebRtcDispMsg(msg){
 $('#webrtc_indic').html(msg);
}
function socketIoMsg(state,msg){
 connected_to_io=true;
     $('#connect_comm').html(msg)
}

	
});