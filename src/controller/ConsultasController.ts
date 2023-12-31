import { Request, Response } from "express";
import { ConsultasBusiness } from "../business/ConsultasBusiness";
import { ConsultasInputDTO } from "../types/ConsultasInputDTO";
import { parse } from 'date-fns';

export class ConsultasController {
  constructor(private consultasBusiness: ConsultasBusiness) {}

  createConsultas = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization as string
      const {  data, hora, status, observacoes, id_nutricionista, id_cliente } = req.body;
      
    const formattedData = parse(data, 'dd/MM/yyyy', new Date());
    const formattedHora = parse(hora, 'HH:mm:ss', new Date());
      const input: ConsultasInputDTO = {
        token,
        data: formattedData,
        hora: formattedHora,
        status,
        observacoes,
        id_nutricionista,
        id_cliente,
      };
      const result = await this.consultasBusiness.createConsultas(input);

      res.status(201).send({ message:"Created successfully.", result });
    } catch (error: any) {
      const { statusCode, message } = error;
      res.status(statusCode || 400).send({ message });
    }
  };
  getConsultaById = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization as string
      const id = req.params.id;
     
      const consulta = await this.consultasBusiness.getConsultaById(id, token)
      res.status(200).send({message: "Query found!", consulta })
  
       
    } catch (error: any) {
      const { statusCode, message } = error;
      res.status(statusCode || 400).send({ message });
    }
  };

  getAllConsultas = async (req: Request, res: Response) => {
    try {
      const result = await this.consultasBusiness.getAllConsultas();
      res.status(200).send({ result });
    } catch (error: any) {
      const { statusCode, message } = error;
      res.status(statusCode || 400).send({ message });
    }
  };
}
