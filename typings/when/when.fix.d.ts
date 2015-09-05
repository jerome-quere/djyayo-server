/// <reference path="./when.d.ts" />

declare function When(): When.Promise<void>;

declare module When {
    function map<T, T2>(array:T[], mapFunc:(item:T)=>When.Promise<T2>):When.Promise<T2[]>;
}

declare module "when/function" {
    import when = require('when');
    import _ = when._;

    function call<T>(
        fn: _.NodeFn0<T>
    ): when.Promise<T>;

    function call<A1, T>(
        fn: _.NodeFn1<A1, T>,
        arg1: A1 | when.Promise<A1>
    ): when.Promise<T>;

    function call<A1, A2, T>(
        fn: _.NodeFn2<A1, A2, T>,
        arg1: A1 | when.Promise<A1>,
        arg2: A2 | when.Promise<A2>
    ): when.Promise<T>;

    function call<A1, A2, A3, T>(
        fn: _.NodeFn3<A1, A2, A3, T>,
        arg1: A1 | when.Promise<A1>,
        arg2: A2 | when.Promise<A2>,
        arg3: A3 | when.Promise<A3>
    ): when.Promise<T>;

    function call<A1, A2, A3, A4, T>(
        fn: _.NodeFn4<A1, A2, A3, A4, T>,
        arg1: A1 | when.Promise<A1>,
        arg2: A2 | when.Promise<A2>,
        arg3: A3 | when.Promise<A3>,
        arg4: A4 | when.Promise<A4>
    ): when.Promise<T>;

    function call<A1, A2, A3, A4, A5, T>(
        fn: _.NodeFn5<A1, A2, A3, A4, A5, T>,
        arg1: A1 | when.Promise<A1>,
        arg2: A2 | when.Promise<A2>,
        arg3: A3 | when.Promise<A3>,
        arg4: A4 | when.Promise<A4>,
        arg5: A5 | when.Promise<A5>
    ): when.Promise<T>;
}