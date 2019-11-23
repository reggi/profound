# `@reggi/profound`

`Profound` is a compostion / flow / pipe library written for typescript.

It allows for code to be written like this:

```ts
import { placeholder, profound } from '@reggi/profound'

const age = placeholder<number>()('age')

const alpha = profound({}, ({ }) => 'hello world I\'m a profound')
// console.log(alpha()) // hello world I\'m a profound

const beta = profound({ alpha }, ({ alpha }) => `I am using alpha as a dependency (${alpha})`)
// console.log(beta()) // I am using alpha as a dependency (hello world I'm a profound)

const gamma = profound({ alpha, beta }, ({ alpha, beta }) => `
    Gamma needs alpha and beta to run.
    Rather then being very redundent and running both in here. They are fetched for use. 
    If you pass alpha or beta into gamma, they are not run. 
    This function also takes any arguments that alpha, or beta need.
    Profounds become async: 
        1. If their dependencies are async and are being run (input dependent)
        2. If this callback is async
    (${alpha} ${beta})
`)

const delta = profound({ age, gamma }, ({ age, gamma }) => gamma.length + age)

console.log(delta({ age: 30 })) // 514
```