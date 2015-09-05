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

import { Database } from './Database'
import { Room } from './Room'

export class RoomManager {

    private database:Database;

    /**
     *
     */
    public constructor(database:Database) {
        this.database = database;
    }

    /**
     *
     */
    public findByName(name:string):When.Promise<Room> {

        return this.database.find("room", {name: name}).then((docs:any[]) => {
            if (_.isEmpty(docs)) {
                return null;
            }

            return this.loadRoom(docs[0]);
        });
    }

    /**
     *
     */
    public findAll():When.Promise<Room[]> {
        return this.database.find("room").then((docs:any) => {
           return when.map(docs, this.loadRoom);
        });
    }

    /**
     *
     */
    private loadRoom(doc:any) {
        var room = new Room();
        return room.load(doc).then(() => {
            return room;
        });
    }
}