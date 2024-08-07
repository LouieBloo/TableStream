import io, { Socket } from 'socket.io-client';
import { Message } from '../interfaces/messages';

class WebRTCService {
  private socket: Socket | null = null;
  private localStream: MediaStream | null = null;
  private peerConnections: { [key: string]: RTCPeerConnection } = {};
  private remoteStreams: { [key: string]: MediaStream } = {};
  private onStreamAdded: ((id: string, stream: MediaStream) => void)[] = [];
  private onStreamRemoved: ((id: string) => void)[] = [];

  private onMessage: ((message: Message) => void)[] = [];

  private roomName:string = "";
  private playerName:string = "";


  constructor() {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    this.socket.on('signal', this.handleSignal);
    this.socket.on('newPeer', this.handleNewPeer);
    this.socket.on('peerDisconnected', this.handlePeerDisconnected);
    this.socket.on('message', this.handleMessage);
  }

  public async initLocalStream(): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    console.log(this.localStream)
    return this.localStream;
  }

  public subscribeToStreamAdd(callback: (id: string, stream: MediaStream) => void) {
    this.onStreamAdded.push(callback);
  }

  public unSubscribeToStreamAdd(callback: any){
    this.onStreamAdded = this.onStreamAdded.filter((checkCallback)=>{checkCallback != callback})
  }

  public setOnStreamRemoved(callback: (id: string) => void) {
    this.onStreamRemoved.push(callback);
  }

  public joinRoom(roomName: string, playerName: string) {
    if (this.socket) {
      this.socket.emit('joinRoom', { roomName, playerName });

      this.roomName = roomName;
      this.playerName = playerName
    }
  }

  public getStream(socketId:string){
    if(this.remoteStreams[socketId]){
      return this.remoteStreams[socketId]
    }
    return null;
  }

  private handleSignal = async (data: { from: string; signal: any }) => {

    console.log("Handle signal: ", data.from, data.signal)

    const { from, signal } = data;
    if (!this.peerConnections[from]) {
      this.createPeerConnection(from);
    }
    const peerConnection = this.peerConnections[from];
    if (signal.type === 'offer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      this.socket?.emit('signal', { to: from, signal: peerConnection.localDescription });
    } else if (signal.type === 'answer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
    } else if (signal.candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(signal));
    }
  };

  private handleNewPeer = (data: { socketId: string }) => {
    const { socketId } = data;
    this.createPeerConnection(socketId);
  };

  private handlePeerDisconnected = (data: { socketId: string }) => {
    const { socketId } = data;
    if (this.peerConnections[socketId]) {
      this.peerConnections[socketId].close();
      delete this.peerConnections[socketId];
    }
    if (this.remoteStreams[socketId]) {
      delete this.remoteStreams[socketId];
    }

    this.onStreamRemoved.forEach(callback => callback(socketId));
  };

  private createPeerConnection(socketId: string) {
    console.log("Creating peer connection: ", socketId)
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Add Google STUN server
    };
    const peerConnection = new RTCPeerConnection(configuration);
    this.peerConnections[socketId] = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('signal', { to: socketId, signal: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      this.remoteStreams[socketId] = event.streams[0];
      this.onStreamAdded.forEach(callback => callback(socketId, event.streams[0]));
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Listen for negotiation needed event to handle offer/answer exchange
    peerConnection.onnegotiationneeded = async () => {
      try {
        if (peerConnection.signalingState === 'stable') {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          this.socket?.emit('signal', { to: socketId, signal: peerConnection.localDescription });
        }
      } catch (error) {
        console.error('Error during negotiation', error);
      }
    };

    // if (this.socket) {
    //   peerConnection.createOffer().then((offer) => {
    //     peerConnection.setLocalDescription(offer).then(() => {
    //       this.socket?.emit('signal', { to: socketId, signal: peerConnection.localDescription });
    //     });
    //   });
    // }
  }

  public sendMessage(message: string) {
    if (this.socket) {
      this.socket.emit('message', {
        roomName: this.roomName,
        playerName: this.playerName,
        message: message 
      });
    }
  }

  private handleMessage = (message: Message) => {
    this.onMessage.forEach(callback => callback(message));
  };

  public subscribeToMessage = (callback: (message: Message) => void)=>{
    this.onMessage.push(callback);
  }

  public unSubscribeToMessage = (callback: (message: Message) => void)=>{
    this.onMessage = this.onMessage.filter((checkCallback)=>{checkCallback != callback})
  }
}

export const webrtcService = new WebRTCService();
