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

import net = require('net');
import when = require('when');
import _ = require('lodash');

import { Config } from './Config';
import { Model } from '../model/Model';
import { Player } from './Player';
import { Logger } from '../utils/Logger';

export class PlayerServer {

    private config:Config;
    private model:Model;
    private server:net.Server;

    private players:Player[];

    private startDefer:When.Deferred<void>;

    /**
     *
     */
    constructor(config:Config, model:Model) {
        this.config = config;
        this.model = model;
        this.players = [];
        this.server = net.createServer(_.bind(this.onNewClient, this));
        this.server.on('error', _.bind(this.onError, this));
    }

    /**
     *
     */
    public start():When.Promise<void> {
        this.startDefer = when.defer<void>();
        this.server.listen({port: this.config.getPlayerPort()}, () => {
            this.startDefer.resolve();
            this.startDefer = null;
        });
        return this.startDefer.promise;
    }

    /**
     *
     */
    private onNewClient(socket:net.Socket):void {
        let id:string = _.uniqueId('player');
        let player:Player = new Player(id, socket);

        player.on('disconnect', () => {
            _.remove(this.players, {id: id});
        });

        player.hello()
            .then((roomName:string) => {
                Logger.debug("Whant to join room ", roomName);
            })
            .catch((error:any) => {
                player.shutdown();
            });

        this.players.push(player);
    }

    /**
     *
     */
    private onError(error:any):void {
        if (this.startDefer) {
            this.startDefer.reject(error);
            this.startDefer = null;
        }
        throw error;
    }
}
