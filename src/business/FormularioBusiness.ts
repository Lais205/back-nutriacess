import { ClienteData } from "../data/ClienteData";
import { FormularioData } from "../data/FormularioData";
import { CustomError } from "../error/CustomError";
import { AvatarsEnum, FormularioModel, TIPO } from "../model/FormularioModel";
import { IdGenerator } from "../services/idGenerator";
import { TokenGenerator } from "../services/tokenGenerator";
import { FormularioInputDTO } from "../types/FormularioInputDTO";

export class FormularioBusiness {
  constructor(
    private idGenerator: IdGenerator,
    private tokenGenerator: TokenGenerator,
    private formData: FormularioData,
    private clienteData: ClienteData
  ) {}
  public async createForm(input: FormularioInputDTO) {
    try {
      const {
        token,
        objetivo,
        genero,
        altura,
        idade,
        peso,
        capacidade_fisica,
        restricao_alimentar,
        tempo_preparo,
        id_cliente,
        foto,
        alergia, 
        plano
      } = input;
      if (!token) {
        throw new CustomError(401, `Authorization token is required`);
      }

      

      const tokenData = this.tokenGenerator.verify(token);

      if (!tokenData) {
       
        throw new CustomError(401, "Invalid token.");
      }
      
      if (
     !alergia ||
        !objetivo ||
        !genero ||
        !altura ||
        !idade ||
        !peso ||
        !capacidade_fisica ||
        !restricao_alimentar ||
        !tempo_preparo 
        ||
        !id_cliente
      ) {
        throw new CustomError(422, "Missing input.");
      }
      if (isNaN(altura) || isNaN(idade) || isNaN(peso)) {
        throw new CustomError(401, "Invalid number!");
      }
      if (foto !== undefined) {
        if (!Object.values(AvatarsEnum).includes(foto)) {
          throw new CustomError(422, "Invalid value for 'foto'");
        }
      }
      if (plano && plano.toLowerCase() !== "plus1" && plano.toLowerCase() !== "plus2" && plano.toLowerCase() !== "familia") {
        throw new CustomError(422, "Plano must be 'plus1', 'plus2' or 'familia'");
      }
      
      if (
        objetivo.toLowerCase() !== "perder peso" &&
        objetivo.toLowerCase() !== "manter peso" &&
        objetivo.toLowerCase() !== "ganhar massa"
      ) {
        throw new CustomError(
          422,
          "Objective accepts  'perder peso', 'manter peso', 'ganhar massa' as a valid result."
        );
      }
      if (
        genero.toLowerCase() !== "masculino" &&
        genero.toLowerCase() !== "feminino" &&
        genero.toLowerCase() !== "outro"
      ) {
        throw new CustomError(
          422,
          "Gender accepts  'feminino', 'masculino', 'outro' as a valid result."
        );
      }
      if (
        capacidade_fisica.toLowerCase() !== "sedentarismo" &&
        capacidade_fisica.toLowerCase() !== "atividade fisica moderada" &&
        capacidade_fisica.toLowerCase() !== "atividade fisica intensa"
      ) {
        throw new CustomError(
          422,
          "Physical capacity accepts  'sedentarismo', 'atividade fisica moderada', 'atividade fisica intensa' as a valid result."
        );
      }
      if (
        alergia.toLowerCase() !== "gluten" &&
        alergia.toLowerCase() !== "laticinios" &&
        alergia.toLowerCase() !== "amendoim" &&
        alergia.toLowerCase() !== "peixes" &&
        alergia.toLowerCase() !== "ovos" &&
        alergia.toLowerCase() !== "mariscos" &&
        alergia.toLowerCase() !== "nenhum"
      ) {
        throw new CustomError(
          422,
          "Alergia accepts 'gluten', 'laticinios', 'amendoim', 'peixes', 'ovos', 'mariscos' or 'nenhum' as valid results."
        );
      }
      
      if (
        restricao_alimentar.toLowerCase() !== "qualquer coisa" &&
        restricao_alimentar.toLowerCase() !== "vegetariano" &&
        restricao_alimentar.toLowerCase() !== "vegano"
      ) {
        throw new CustomError(
          422,
          "Food restriction accepts  'qualquer coisa', 'vegetariano', 'vegano' as a valid result."
        );
      }
      if (
        tempo_preparo.toLowerCase() !== "sim" &&
        tempo_preparo.toLowerCase() !== "não"
      ) {
        throw new CustomError(
          422,
          "Preparation time accepts  'sim', 'não' as a valid result."
        );
      }

      const clienteExists = await this.clienteData.findClienteById(id_cliente);
      if (!clienteExists) {
        throw new CustomError(404, `Client could not be found`);
      }

      const id_formulario = this.idGenerator.generate();
      const newForms = new FormularioModel(
        id_formulario,
        objetivo,
        genero,
        altura,
        idade,
        peso,
        capacidade_fisica,
        restricao_alimentar,
        tempo_preparo,
        foto,
        id_cliente,
        alergia,
        plano
      );
      console.log(newForms);
      
      await this.formData.createFormulario(newForms);
      return newForms;
    } catch (error: any) {
      throw new CustomError(error.statusCode, error.message);
    }
  }
  
  public async getFormById(id_formulario: string, token: string) {
    try {
      if (!token) {
        throw new CustomError(401, "Insert a token please!")
    }
    if (!id_formulario) {
      throw new CustomError(400,"Insert a id_formulario please!")
  }
  const formTokenData = this.tokenGenerator.verify(token)

  if(!formTokenData){
    throw new CustomError(401, "Invalid token!")
  }

  const form = await this.formData.findFormularioById(id_formulario)

  if(!form){
    throw new CustomError(400,"There is no form with that ID!")
  }
  return form;
    } catch (error: any) {
      throw new CustomError(error.statusCode, error.message);
    }
  }

  public async getAllFormularios () {
    try {
     
      const results = await this.formData.getFormularios();
      return results;
    } catch (error: any) {
      throw new CustomError(error.statusCode, error.message);
    }
  };
  
  public async updatePlano(id_formulario: string, plano: TIPO, token: string) {
    try {
      const form = await this.formData.findFormularioById(id_formulario);
      if (!form) {
        throw new CustomError(404, `Form with ID ${id_formulario} not found.`);
      }
      const tokenData = this.tokenGenerator.verify(token);

      if (!tokenData) {
        throw new CustomError(401, "Invalid token.");
      }
      if (!id_formulario) {
        throw new CustomError(400, "Insert an id_formulario please!");
      }

      if (
        plano.toLowerCase() !== "plus1" &&
        plano.toLowerCase() !== "plus2" &&
        plano.toLowerCase() !== "familia"
      ) {
        throw new CustomError(
          400,
          "Invalid value for 'plano'. Must be 'plus1', 'plus2' or 'familia'."
        );
      }
      if (!plano) {
        throw new CustomError(400, "Missing 'plano' field.");
      }

      const update = await this.formData.updatePlano(id_formulario, plano);

      return update;
    } catch (error: any) {
      throw new CustomError(error.statusCode, error.message);
    }
  }

}



