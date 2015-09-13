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

import _ = require('lodash');
import when = require('when');

import { Entity } from './Entity';
import { Model } from './Model';

/**
 *
 */
export class User extends  Entity<User> {
    public _id:string = null;
    public fullName:string = null;
    public lastName:string = null;
    public firstName:string = null;
    public pictureUrl:string = null;

    public sourceType:string = null;
    public sourceId:string = null;

    /**
     *
     */
    constructor() {
        super();
    }

    /**
     *
     */
    public static serialize(user:User, done:any):void {
        done(null, user._id);
    }

    /**
     *
     */
    public static deserialize(model:Model, id:string, done:any):void {
        model.getUserManager().findById(id)
            .then((user:User) => {
                if (!_.isNull(user)) {
                    return done(null, user);
                }
                done(null, null);
            })
            .catch((error:any) => {
                done(error, null);
            });
    }

    /**
     *
     */
    public hydrate(document:any):When.Promise<User> {
        this._id = document._id;
        this.fullName = document.fullName;
        this.lastName = document.lastName;
        this.firstName = document.firstName;
        this.pictureUrl = document.pictureUrl;
        this.sourceType = document.sourceType;
        this.sourceId = document.sourceId;
        return when(this);
    }
}
