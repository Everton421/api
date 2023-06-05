import { Router } from "express";

const mysql = require('mysql') 

var con = mysql.createConnection({
    host: "192.168.100.106",
    user: "root",
    password: "Nileduz",
    
    database:"clseg_estoque",
    database2:"clseg_publico",
    database3:"clseg_vendas",
    
    
  })  

export const router = Router()

 router.all('/',(req,res)=>{    
        const client = 11
        //const reqProd = req.body

        const reqProd = req.body

     con.query(`INSERT INTO clseg_vendas.cad_orca (cliente)  VALUES(${client})`,(err: string,result:any)=>{
            if(err) throw err;
            

            const codOrca = result.insertId;    
            console.log(`orçamento num: ${codOrca}`)

     
            
         
            var produto:any = reqProd
        
       for(let i =0; i <=  reqProd.length; i++){
        if(reqProd[i] ==undefined){
     break;
    }
     console.log(reqProd[i].prod)
    let j = i+1;

   con.query(`INSERT INTO clseg_vendas.pro_orca (orcamento, sequencia, produto) values(${codOrca},${j}, ${produto[i].prod})`,(err:string,response:any)=>{
                if(err) throw err;
            })
            console.log("produto inserido"+reqProd[i].prod)
     
        }      

})

    });

    router.get('/produtos',(req,res)=>{
        con.query('select cp.codigo,cp.descricao,tp.PRECO from clseg_publico.cad_prod cp join clseg_publico.prod_tabprecos tp on tp.PRODUTO = cp.CODIGO where tp.TABELA = 1 LIMIT 20;',(err:string, response:any)=>{
            if(err) throw err;
            res.json(response)
        })

        router.get('/clientes',(req,res)=>{
            con.query('select codigo,nome ,cpf from clseg_publico.cad_clie;',(err:string, response:any)=>{
                if(err) throw err;
                res.json(response)
            })
        })

      


    })
