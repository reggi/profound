namespace Poly {
    export type Omit<T, K extends string | number | symbol> = { [P in Exclude<keyof T, K>]: T[P]; }
}

namespace Use {
    type ThenArg<T> = T extends Promise<infer U> ? U : T
    type RelatedThen<A, B> = A extends Promise<infer U> ? Promise<B> : B
    export type Func = (...args: any[]) => any
    export type Return<A extends Func, B> = RelatedThen<ReturnType<A>, B>
    export type CallbackValue<A extends Func> = ThenArg<ReturnType<A>>
}

namespace Profound {
    export type Func = (...arg: any) => any
    export type SingleArgFunc = (arg: any) => any
    export type SingleArgFuncs = { [k: string]: SingleArgFunc }
    export namespace Params {
        type Func = (arg: any) => any
        type Funcs = { [k: string]: Func }
        type FirstArg<T extends any> =
            T extends [infer R, ...any[]] ? R :
            T extends [] ? undefined :
            T;
        type ThenArg<T> = T extends Promise<infer U> ? U : T

        type UnionToIntersectionValues<U, K extends keyof U = keyof U> =
            ([K] extends [never]
                ? unknown
                : K extends unknown
                ? (k: U[K]) => void
                : never
            ) extends (k: infer I) => void ? I : never


        export type FnsBoth<T extends Funcs> = UnionToIntersectionValues<{
            [K in keyof T]: Parameters<T[K]>[0] extends undefined ?
            { [KK in K]?: ThenArg<ReturnType<T[K]>> } :
            { [KK in K]: ThenArg<ReturnType<T[K]>> } | FirstArg<Parameters<T[K]>>
        }>

        export type FnsNoArg<T extends Funcs> = UnionToIntersectionValues<ObjEmptyNever<ObjWithoutNever<{
            [K in keyof T]: Parameters<T[K]>[0] extends undefined ?
            { [KK in K]?: ThenArg<ReturnType<T[K]>> } :
            never
        }>>>

        export type FnsHasArg<T extends Funcs> = UnionToIntersectionValues<ObjEmptyNever<ObjWithoutNever<{
            [K in keyof T]: Parameters<T[K]>[0] extends undefined ?
            never :
            { [KK in K]: ThenArg<ReturnType<T[K]>> } | FirstArg<Parameters<T[K]>>
        }>>>


        export type Keys<T> = { [K in keyof T]: T[K] }[keyof T]
        export type ObjEmptyNever<T> = Keys<T> extends never ? never : T
        export type ObjKeysWithoutNever<T> = { [K in keyof T]: T[K] extends never ? never : K }[keyof T]
        export type ObjWithoutNever<T> = Pick<T, ObjKeysWithoutNever<T>>;
        export type ObjClean<T> = ObjEmptyNever<ObjWithoutNever<T>>

        export type FnsOverride<T> = { [K in keyof T]: T[K] extends Func ? ThenArg<ReturnType<T[K]>> : never }
        export type FnArguments<T> = ObjClean<{ [K in keyof T]: T[K] extends (arg: any) => any ? Parameters<T[K]>[0] extends undefined ? never : Parameters<T[K]>[0] : never }>

        export type Value<T extends Funcs> = FnArguments<T> extends never ? Partial<FnsOverride<T>> | void : FnsHasArg<T> | FnsNoArg<T>

        // export type Value<T extends Funcs> = FnArguments<T> extends never ? FnsBoth<T> | void : FnsBoth<T>

        // export type Value<T extends Funcs> = FnsHasArg<T> & FnsNoArg<T>
        // export type Value<T> = FnsBoth<T>
    }

    export namespace Callback {
        type ThenArg<T> = T extends Promise<infer U> ? U : T
        export type ObjReturn<T> = { [K in keyof T]: T[K] extends SingleArgFunc ? ThenArg<ReturnType<T[K]>> : never }
    }

    export namespace Return {
        export type IsPromise<T> = T extends Promise<infer I> ? T : never
        export type FnIsPromise<T> = T extends (...args: any) => any ? IsPromise<ReturnType<T>> : never
        export type FnIsPromiseFn<T> = T extends (...args: any) => any ? IsPromise<ReturnType<T>> extends never ? never : T : never
        // gets object keys in object, never if no keys
        export type Keys<T> = { [K in keyof T]: T[K] }[keyof T]
        // get object if has keys, never if no keys
        export type ObjEmptyNever<T> = Keys<T> extends never ? never : T
        // gets object keys without value set to never
        export type ObjKeysWithoutNever<T> = { [K in keyof T]: T[K] extends never ? never : K }[keyof T]
        // gets object without never keys
        export type ObjWithoutNever<T> = Pick<T, ObjKeysWithoutNever<T>>;
        // gets functions that return promises in object never if empty, without never properties
        export type ObjFnIsPromise<T> = ObjEmptyNever<ObjWithoutNever<{ [K in keyof T]: FnIsPromise<T[K]> }>>
        // removes keys from B in A
        export type ObjDiff<A, B> = Poly.Omit<A, keyof B>[keyof Poly.Omit<A, keyof B>]
        // gets promises from A and removes them if theyr'e in C
        export type ObjPromiseDiff<A, C> = ObjFnIsPromise<A> extends never ? never : ObjDiff<ObjFnIsPromise<A>, C>
        // if B returns promise, or if there are promises in A and don't match keys in C
        export type RetunsPromise<A, B, C> = FnIsPromiseFn<B> | ObjPromiseDiff<A, C>
        // if promise, provides inner promise type
        type ThenArg<T> = T extends Promise<infer U> ? U : T
        // gets return type from function, withou inner promise if any
        type ReturnValue<T extends SingleArgFunc> = T extends (args: any) => any ? ThenArg<ReturnType<T>> : never
        // gets all return types in an object of functions
        type ObjReturn<T extends SingleArgFuncs> = { [K in keyof T]: ReturnValue<T[K]> }
        // checks A diffed with C for promsies, if so wraps all ObjectReturns in promise 
        type ReturnNoCallback<A extends SingleArgFuncs, B, C> = ObjPromiseDiff<A, C> extends never ? ObjReturn<A> : Promise<ObjReturn<A>>
        // checks for promise, returns value of inner callback wrapped in promise
        type ReturnYesCallback<A, B extends SingleArgFunc, C> = RetunsPromise<A, B, C> extends never ? ReturnValue<B> : Promise<ReturnValue<B>>
        // checks if callback is available, before deligation of return 
        // export type Value<A, B, C> = unknown extends B ? ReturnNoCallback<A, B, C> : ReturnYesCallback<A, B, C>
        // for some reason have to check if B actually returns something because `B` is known
        export type Value<A extends SingleArgFuncs, B extends SingleArgFunc, C> = unknown extends ReturnValue<B> ? ReturnNoCallback<A, B, C> : ReturnYesCallback<A, B, C>
    }
}

export function isPromise(obj: any) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

function use<A extends Use.Func, G>(fn: A, callback: (e: Error | null, a: Use.CallbackValue<A>) => G) {
    return (...args: Parameters<A>): Use.Return<A, G> => {
        try {
            const v = fn(...args as any[])
            if (isPromise(v)) {
                return v.then((v: any) => callback(null, v)).catch((e: any) => callback(e, undefined as Use.CallbackValue<A>))
            }
            return callback(null, v) as Use.Return<A, G>
        } catch (e) {
            return callback(e, undefined as Use.CallbackValue<A>) as unknown as Use.Return<A, G>
        }
    }
}

export function placeholder<T>() {
    return <G extends string>(param: G) => {
        return (a: Record<G, T>): T => {
            throw new Error(`Need ${param}`)
        }
    }
}

const profoundRef = Symbol('Profound')

function isPlainObject(obj: any): obj is ({ [name: string]: any }) {
    return obj && obj.constructor === Object || false;
}

function pick(o: any, ...props: string[]) {
    return Object.assign({}, ...props.map(prop => ({ [prop]: o[prop] })));
}

function nest<T>(value: T): () => T {
    return () => {
        return value
    }
}

export function profound<A extends Profound.SingleArgFuncs, G, B extends (a: Profound.Callback.ObjReturn<A>) => G, C extends Profound.Params.Value<A>>(funcs: A, callback?: B) {
    function reduceObjectOfFuncs(funcs: any, input: any = {}) {
        if (!isPlainObject(input)) throw new Error('Needs to be plain object')
        const keys = Object.keys(funcs)
        return keys.reduce((acq: Profound.Func, key: string) => {
            return use(acq, (acqError, acqValue) => {
                if (acqError) throw acqError
                if (acqValue && acqValue[key]) return acqValue
                const isProfound = Boolean(funcs[key] &&
                    funcs[key].isProfound &&
                    funcs[key].isProfound === profoundRef &&
                    funcs[key].pass)
                const fn = (isProfound) ? funcs[key].pass : funcs[key]
                return use(fn, (fnError, fnValue) => {
                    if (fnError) throw fnError
                    const [value, data] = (isProfound) ? fnValue : [fnValue, {}]
                    return { ...acqValue, ...data, [key]: value }
                })(acqValue)
            })
        }, nest(input))()
    }
    // NOTE returns (callbackValue)
    // NOTE MARKER
    function profound(preInput: C): Profound.Return.Value<A, B, C> {
        return use(reduceObjectOfFuncs, (err, input) => {
            if (err) throw err
            const keys = Object.keys(funcs)
            if (!callback) return pick(input, ...keys)
            return use(callback as Profound.Func, (err, callbackValue) => {
                if (err) throw err
                return callbackValue
            })(input)
        })(funcs, preInput)
    }
    // NOTE returns ([callbackValue, reduceObjectOfFuncsValues])
    function pass(...preInput: any): any {
        const prein = preInput[0] || {}
        return use(reduceObjectOfFuncs, (err, input) => {
            if (err) throw err
            const keys = Object.keys(funcs)
            if (!callback) return [pick(input, ...keys), input]
            return use(callback as Profound.Func, (err, callbackValue) => {
                if (err) throw err
                return [callbackValue, input]
            })(input)
        })(funcs, prein)
    }
    profound.isProfound = profoundRef
    profound.pass = pass
    return profound
}


