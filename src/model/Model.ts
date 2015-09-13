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

import { RoomManager } from './RoomManager';
import { UserManager } from './UserManager';
import { Database } from './Database';
import { SessionStore } from './SessionStore';

export * from './RoomManager';
export * from './UserManager';
export * from './SessionStore';

export class Model {

    private database:Database;
    private roomManager:RoomManager;
    private sessionStore:SessionStore;
    private userManager:UserManager;

    /**
     *
     */
    constructor(dbPath:string) {
        this.database = new Database(dbPath);
        this.roomManager = new RoomManager(this.database);
        this.sessionStore = new SessionStore(this.database);
        this.userManager = new UserManager(this.database);
    }

    /**
     *
     */
    public getRoomManager():RoomManager {
        return this.roomManager;
    }

    /**
     *
     */
    public getSessionStore():SessionStore {
        return this.sessionStore;
    }

    /**
     *
     */
    public getUserManager():UserManager {
        return this.userManager;
    }

    /**
     *
     */
    public start():When.Promise<void> {
        return this.database.start();
    }
}
