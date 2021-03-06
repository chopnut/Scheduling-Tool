<?php

require_once("../react_api/includes.php");

use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\Wamp\WampServer;
use Models\SCSTRealtimeSubsObject;

// The event loop that will keep on triggering
$loop   = React\EventLoop\Factory::create();

// Our custom pusher that will do the logic, $loop is optional
$pusher =  new SCSTRealtimeSubsObject();

// Listen for the web server to make a ZeroMQ push after an ajax request
$context    = new React\ZMQ\Context($loop);
$pull       = $context->getSocket(ZMQ::SOCKET_PULL);

$pull->setSockOpt(ZMQ::SOCKOPT_HWM, 0);
$pull->bind("tcp://127.0.0.1:".RT_SERVER_PORT); //Binding to itself means the client can only connect to itself
$pull->on('error', function ($e) { 
    echo $e->getMessage();
 });
 
//On a 'message' event, pass the data to the myMessageHandler method of the MyPusherClass
$pull->on('message', array($pusher, 'onSend'));

echo "Realtime server now listening on localhost@".RT_CLIENT_PORT.". Binded to ".RT_SERVER_PORT."\n";

// Set up our WebSocket server for clients wanting real-time updates
$webSock   = new React\Socket\Server('0.0.0.0:'.RT_CLIENT_PORT, $loop); // Binding to 0.0.0.0 means remotes can connect
$webServer = new Ratchet\Server\IoServer(
    new HttpServer(
        new WsServer(
            new WampServer(
                $pusher
            )
        )
    ),
    $webSock
);

$loop->run();

?>