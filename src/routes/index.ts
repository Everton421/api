import { Router } from "express";

const mysql = require('mysql') 

var con = mysql.createConnection({
    host: "192.168.100.106",
    user: "root",
    password: "Nileduz",
    
    database:"wp_estoque",
    database2:"wp_publico",
    database3:"wp_vendas",
    
    
  })  

export const router = Router()


/* 
router.get('/', (req ,res )=>{
        con.query('Select * from cep;',(err:string, result:string)=>{
            if(err) throw err;
            res.json(result) 
        })
    
})

*/
router.get('/', (req ,res )=>{
    con.query(
        `select cp.codigo, cp.descricao, ps.estoque from wp_publico.cad_prod cp join wp_estoque.prod_setor ps on cp.codigo = ps.produto;`
    ,(err:string, result:string)=>{
        if(err) throw err;
        res.json(result) 
    })

})

