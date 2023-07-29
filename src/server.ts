import {app} from './app'

    const porta = process.env.PORT || 3000

   const server =  app.listen(porta, ()=>{
        console.log(`app rodando ${porta} `)
    })


    process.on('SIGINT',()=>{
        server.close()
        console.log("app finalizado")
    })