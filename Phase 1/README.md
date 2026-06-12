This phases focuse on WebRTC, i.e. Web Real Time Communication.

In order to understand WebRTC, we need to understand few thing first.
1. NAT : Network Address Translation
    Most of our devices like mobiles and pc, hide behind a router. They do not disclose their public IP to the outside world, insted they communicate using the router's IP.
    This works as following:
    - Device A  from port 4329 sends a request to device B on port 9875.
    - This request goes to the router which is device A's edge router.
    - The router hides device A IP and it masks it with its own IP and port number.
    - It then creates a table to lookup, so it can send incoming messages correctly.
    - There are types of NAT, but lets not go that deep.

2. STUN server : Session Traversal Utilities for NAT
    This is simple, it just tells u what your IP looks from the outside world.
    This works as following:
    - Device A sends a request to a STUN server.
    - This request goes to the router which is device A's edge router.
    - The router hides device A IP and it masks it with its own IP and port number.
    - It then creates a table to lookup, so it can send incoming messages correctly.
    - When the STUN server recieves the request,it takes the IP address and wraps it in a packet and send it back to the router.
    - Router mathces the table, and send it back to Device A
    - Device A can now look inside the packet and boom, u know how u look from outside.

    Google host STUN servers free of cost.

3. TURN server : Traversal Usig Relays around NAT
    This is not free. It is used when Device A wants to send message to Device B but B's NAT or firewall or proxies block the message.
    In that case, both device connects to a TURN server and message exchange happens like:
    A ------ TURN -------- B.

4. ICE : Interactive Connectivity Establishment
    Understand it like this, Device A wants to know all the possible ways another device can connect to it.
    Each of the way is an ICE candidate. The browser wraps it and other info into SDP.

5. SDP : Session Discription Protocol
    It is not really a protocol but a a text format that describes WebRTC session.
    It's not a protocol for transferring data — it's a document that says 'here's what I support and here's how to reach me.'
    Two peers exchange SDP documents to agree on how they'll communicate.


        Two peers exchange SDP documents to agree on how they'll communicate.

This means those two peers which want to connect to each other, must share their SDP somehow. Well, then what's the point of connecting. 

WebRTC has its own advantages so we will want to connect and for that we need to exchange SDP using WhatsApp or twitter or any means.

Last we need the RTC data channel :  a channel over which data would be sent.

------ Thats all the theory------
----
Lets take a look at the code
Each tab will have a local discription -> its own SDP and remote discription ---> peer's SDP.

We will assume , we are writing in the console inside the browser.

Tab A:

    const lc = new RTCPeerConnection() // lc ====> local discription
    const dc = lc.createDataChannel("chat") // dc ======> data channel
    dc.onopen => () => console.log("Channel open")
    dc.onmessage => e => console.log("Got message: ", e.data)

    lc.onIceCandidate = e => console.log("New ice candidate, reprinting SDP", JSON.stringify(lc.localDescription))

    lc.creatOffer().then(o => lc.setLocalDescription(o)).then(() => console.log("Local description set")) // creatOffer return a promise, then we set local discrption which again returns a promise.

    Now, we got the offer, We take this offer and give it to tab b.

Tab B:

    const offer = {} // the message that we got
    cosnt rc = new RTCPeerConnection() // rc === > remote connection
    
    rc.onIceCandidate = e => console.log("New ice candidate, reprinting SDP", JSON.stringofy(rc.localDescription))

    rc.ondatachannel = e => {
        rc.dc = e.channel;
        rc.dc.onopen = e => console.log("Connection Open");
        rc.dc.onmessage = e => console.log("Got message: ", e.data);
    }

    rc.setRemoteDescription(offer).then(() => console.log("Offer set"))

    rc.creatAnswer.then(a => rc.setLocalDescription(a)).then(console.log("answer created)) // This will give B's SDP which we will take and give to A.

Tab A:

    const answer = {} //  the data we got from B.
    lc.setRemoteDescription(answer) // after this , if all goes well, we will get channel open.




-----
That's all about webRTC, how to go over this phase.
In this phase, i will be building 3 projects.

1. Manual WebRTC chat
2. Tiny File transer
3. STUN test tool



