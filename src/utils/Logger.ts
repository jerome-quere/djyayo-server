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

export class Logger {

    /**
     *
     */
    public static debug(...args:any[]):void {
        console.log(`DEBUG  ${Logger.getDate()} - ${Logger.getStr(...args)}`);
    }

    /**
     *
     */
    public static warn(...args:any[]):void {
        console.log(`WARN   ${Logger.getDate()} - ${Logger.getStr(...args)}`);
    }

    /**
     *
     */
    public static error(...args:any[]):void {
        console.log(`ERROR  ${Logger.getDate()} - ${Logger.getStr(...args)}`);
    }

    /**
     *
     */
    public static info(...args:any[]):void {
        console.log(`INFO   ${Logger.getDate()} - ${Logger.getStr(...args)}`);
    }

    /**
     *
     */
    private static getDate():string {
        let date:Date = new Date();
        let str:string = `${date.getFullYear()}-${Logger.twoDigits(date.getMonth() + 1)}-${Logger.twoDigits(date.getDate())}`;
        str = `${str} ${Logger.twoDigits(date.getHours())}:${Logger.twoDigits(date.getMinutes())}:${Logger.twoDigits(date.getSeconds())}`;
        return str;
    }

    /**
     *
     */
    private static getStr(...args:any[]):string {
        let str:string = '';
        args.forEach((arg:any) => {
            str = `${str} ${arg}`;
            if (arg.stack) {
                str = `${str} ${arg.stack}`;
            }
        });
        return str;
    }

    /**
     *
     */
    private static twoDigits(nb:number):string {
       return (nb >= 10) ? `${nb}` : `0${nb}`;
    }
}
