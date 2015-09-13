/*
 *The MIT License (MIT)
 *
 * Copyright (c) 2015 Jérôme Quéré <contact@jeromequere.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:#
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import events = require("events");
import net = require('net');
import when = require('when');
import _ = require('lodash');

import { Logger } from '../utils/Logger';

class PlayerMessage {
    public name:string;
    public args:any;
    public waitForResponse:boolean;

    /**
     *
     */
    constructor(name:string = null, args:any = null, waitForResponse:boolean = false) {
        this.name = name;
        this.args = args;
        this.waitForResponse = waitForResponse;
    }
}

export class Player extends events.EventEmitter {

    private MAX_BUFFER_SIZE:number = 10485760; // 10 Mib

    private id:string;
    private socket:net.Socket;
    private buffer:string;
    private pingInterval:NodeJS.Timer;
    private pingReceived:boolean;
    private defers:When.Deferred<PlayerMessage>[];

    /**
     *
     */
    constructor(id:string, socket:net.Socket) {
        super();

        this.socket = socket;
        this.id = id;
        this.buffer = "";
        this.defers = [];
        this.pingReceived = true;
        this.pingInterval = setInterval(_.bind(this.sendPing, this), 20 * 1000);

        this.socket.on('close', _.bind(this.onClose, this));
        this.socket.on('error', _.bind(this.onError, this));
        this.socket.on('data', _.bind(this.onData, this));
        this.socket.setEncoding('utf8');
    }

    /**
     *
     */
    public play(uri:string):When.Promise<boolean> {
        return this.sendCommand('play', uri, true).then((response:PlayerMessage) => {
            return response.name === "success";
        });
    }

    /**
     *
     */
    public stop():When.Promise<boolean> {
        return this.sendCommand('stop', null, true).then((response:PlayerMessage) => {
            return response.name === "success";
        });
    }


    /**
     * // TODO Safely type search results
     */
    public search(query:string):When.Promise<any> {
        return this.sendCommand('search', query, true).then((response:PlayerMessage) => {
            if (response.name === "success") {
                return response.args;
            }
            return null;
        });
    }

    /**
     * // TODO Safely type lookup results
     */
    public lookup(trackUri:string):When.Promise<any> {
        return this.sendCommand('lookup', trackUri, true).then((response:PlayerMessage) => {
            if (response.name === "success") {
                return response.args;
            }
            return null;
        });
    }

    /**
     *
     */
    public hello():When.Promise<string> {
        return this.sendCommand('hello', null, true).then((response:PlayerMessage) => {
            if (response.name === "joinRoom") {
                return response.args['roomName'];
            }
            throw new Error(`Invalid response ${response.name}`);
        });
    }

    /**
     *
     */
    public shutdown():void {
        this.socket.end();
    }

    /**
     *
     */
    private onData(chunk:Buffer):void {

        this.buffer += chunk.toString('utf8');

        while (this.buffer.indexOf("\n") !== -1) {
            let index:number = this.buffer.indexOf("\n");
            let line:string = this.buffer.substr(0, index);
            this.buffer = this.buffer.substr(index + 1);

            let message:PlayerMessage = new PlayerMessage();
            try {
                let tmp:any = JSON.parse(line);
                message.name = tmp.name;
                message.args = tmp.args;
                this.onMessage(message);
            } catch (e) {
                this.shutdown();
            }
        }

        if (this.buffer.length > this.MAX_BUFFER_SIZE) {
            this.shutdown();
        }
    }

    /**
     *
     */
    private sendPing():void {
        if (this.pingReceived === false) {
            this.shutdown();
        } else {
            this.sendCommand('ping', '4242', false);
            this.pingReceived = false;
        }
    }

    /**
     *
     */
    private onMessage(message:PlayerMessage):void {
        if (message.name === "endOfTrack") {
            this.emit('endOfTrack');
        } else if (message.name === "pong") {
            this.pingReceived = true;
        } else if (!_.isEmpty(this.defers)) {
            let defer:When.Deferred<PlayerMessage> = this.defers.shift();
            defer.resolve(message);
        } else {
            // Not suppose to happend
            throw new Error("Got an unexpected command from the player");
        }
    }

    /**
     *
     */
    private onError(error:any):void {
        Logger.error(`[Player]`, error);
    }

    /**
     *
     */
    private onClose():void {
        clearInterval(this.pingInterval);
        process.nextTick(() => this.emit('disconnect'));
        this.defers.forEach((defer:When.Deferred<PlayerMessage>) => {
            defer.reject('Player was disconnected');
        });
    }

    /**
     *
     */
    private sendCommand(name:string|PlayerMessage, args:string = null, waitForResponse:boolean = false):When.Promise<PlayerMessage> {

        let message:PlayerMessage = null;
        if (_.isString(name)) {
            message = new PlayerMessage(<string>name, args, waitForResponse);
        } else {
            message = <PlayerMessage>name;
        }
        this.socket.write(JSON.stringify({name: message.name, args: message.args}));

        if (message.waitForResponse) {
            let defer:When.Deferred<PlayerMessage> = when.defer<PlayerMessage>();
            this.defers.push(defer);
            return defer.promise;
        }
        return null;
    }

}
