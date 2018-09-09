$(document).ready(function() {


  $('#button_connect').click(function(event) {
    /* Act on the event */
    username=$('#txt_uname').val();
    socket.emit('user_join', username);
    console.log("button clicked "+username);
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
 // grabWebCamVideo();
});

socket.on('joinedroom', function(room, clientId) {
  console.log('This peer has joined room', room);
  initiate = false;
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

});

socket.on('bye', function(room) {
  console.log(`Peer leaving room ${room}.`);
 
});

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
  dataChannel = peer_conn.createDataChannel('photos');
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
    console.log('CHANNEL opened!!!');
   
  };

  channel.onclose = function () {
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
* Send message to signaling server
*/
function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}
function logError(err) {
  if (!err) return;
  if (typeof err === 'string') {
    console.warn(err);
  } else {
    console.warn(err.toString(), err);
  }
}


return function processMsg (event) {
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


	
});