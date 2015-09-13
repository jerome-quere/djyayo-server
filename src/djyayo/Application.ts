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

import when = require('when');

import { Config } from './Config';
import { Model } from '../model/Model';
import { HttpServer } from './HttpServer';
import { PlayerServer } from './PlayerServer';
import { Logger } from '../utils/Logger';

export class Application {

    private config:Config;
    private model:Model;
    private httpServer:HttpServer;
    private playerServer:PlayerServer;

    /**
     *
     */
    constructor(config:Config) {
        this.config = config;
        this.model = new Model(config.getDatabasePath());
        this.httpServer = new HttpServer(this.config, this.model);
        this.playerServer = new PlayerServer(this.config, this.model);
    }

    /**
     *
     */
    public run():void {

        this.model.start().then(() => {
            return when.all([this.httpServer.start(), this.playerServer.start()]);
        })
            .then(() => {
                Logger.info(`Application started http listen on [${this.config.getHttpPort()}] player listen on [${this.config.getPlayerPort()}]`);
            })
            .catch((e:any) => {
                Logger.error(e);
                Logger.error("Fail to start the application");
                throw e;
            });
    }
}
