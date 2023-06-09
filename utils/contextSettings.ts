import { CONTEXT_FILE_EXTENSION, CTX_DIR } from "@/config/serverSettings";
import { Validator, ValidatorResult } from "jsonschema";
import fs from 'fs';
import { PROTECTED_CONTEXTS } from "@/config/runtimeSettings";

export class ContextSettings {

  public static Add(contextName: string, mode: string) {

    const filePath = `${CTX_DIR}/${contextName}${CONTEXT_FILE_EXTENSION}`;

    if (contextName?.length > 0) {
      if (fs.existsSync(filePath)) {
        throw(new Error('Context already exists'));
      }
  
      const settings = { contextName: contextName, mode: mode };
  
      if (!this.ValidateBaseSchema(settings)) {
        throw(new Error('Invalid type')); 
      }
  
      if ((settings as BaseContextSettings).mode == 'OpenAI-QA') {
        const text = JSON.stringify(DefaultQAContext(settings.contextName), null, 2);
        fs.writeFileSync(filePath, text, 'utf8');
      } else {
        throw(new Error('Not implemented')); 
      }
    } else {
      throw(new Error('Invalid contextName'));
    }
  }

  public static Check(contextName: string) {

    const filePath = `${CTX_DIR}/${contextName}${CONTEXT_FILE_EXTENSION}`;

    if (!fs.existsSync(filePath)) {
      if (PROTECTED_CONTEXTS.some(x => x == contextName)) {
        this.Add(contextName,'OpenAI-QA');   // if READONLY_CONTEXT Config is missing create it .. 
      } else {
        throw(new Error(`Context '${contextName}' is missing`));       // 
      }
    }
  }

  public static Get(contextName: string): BaseContextSettings {

    const filePath = `${CTX_DIR}/${contextName}${CONTEXT_FILE_EXTENSION}`;

    this.Check(contextName);
    
    const settings = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!this.Validate(settings)) {
      throw(new Error('Invalid context settings'));
    }
    let result = settings as BaseContextSettings;
    result.contextName = contextName; // Make sure contextName is correctly set
    return result;
  }

  public static Validate(settings: any): boolean {
    const v = new Validator();
    let valid: ValidatorResult = v.validate(settings, BaseSchema);
    if (valid.valid) {
      switch((settings as BaseContextSettings).mode) {
        case 'OpenAI-QA':
          valid = v.validate(settings, QASchema);
          break;
        
          default:
            throw new Error('not implemented');
      }
    }
    return valid.valid;
  }

  public static ValidateBaseSchema(settings: any): boolean {
    const v = new Validator();
    const valid = v.validate(settings, BaseSchema);
    return valid.valid;
  }
}

export interface ChatSettings {
  contextName: string;
  maxTokens?: number;
  promptTemperature?: number;
  promptId?: number;
}

export interface BaseContextSettings {
  mode: 'OpenAI-QA' | 'Other' | undefined;    // when extending type, extend BaseSchema, DefaultXXXContext
  timeout: number;  
  contextName: string;
  modelName: string;
  promptId: number;
  prompts: string[][];
}

export interface QAContextSettings extends BaseContextSettings {
  modelTokens: number;
  maxTokens: number;
  promptTemperature: number;
  prepromptTemperature: number;
  prepromptId: number;
  preprompts: string[][];
  numberSource: number;
  returnSource: boolean;
}

export const DefaultQAContext = (namespace: string): QAContextSettings => {
  return {
    mode: 'OpenAI-QA',
    timeout: 30,
    contextName: namespace,
    modelName: 'gpt-3.5-turbo',
    modelTokens: 4096,

    maxTokens: 250,

    promptTemperature: 0.5,
    promptId: 0,
    prompts: [
      [
        `Du bist ein KI-Assistent. Du hilfst beim Erstellen von Marketing Texten für Kunden und Interessenten von ${namespace}.`,  
        `Im Kontext bekommst du einzelne Texte aus einem längeren Dokument das von ${namespace} geschrieben ist.`,
        `Beantworte die Frage konversationsbasiert und verwende dazu den bereitgestellten Kontext und andere Quellen zu den Themen IT und Individualsoftwareentwicklung.`,
        `Bitte erfinde keine Hyperlinks.`,
        ``,
        `Frage: {question}`,
        `=========`,
        `{context}`,
        `=========`,
        `Antworte in Markdown:`
      ]
    ],


    // alter preprompt: `Gegeben ist die folgende Unterhaltung und eine Folgefrage. Formuliere die Folgefrage um, so dass sie eine eigenständige Frage wird.`    
    prepromptTemperature: 0.5,
    prepromptId: 0,
    preprompts: [
      [
        `Gegeben ist der Chat-Verlauf und eine Folgefrage.`,
        `Formuliere die Folgefrage als eigenständige Frage, die berücksichtigt, ob der Chat-Verlauf für die Antwort relevant ist oder nicht und so, dass sie auch ohne den Chat-Verlauf verstanden wird.`,
        ``,
        `Chat-Verlauf:`,
        `{chat_history}`,
        `Folgefrage: {question}`,
        `Eigenständige Frage:`
      ]
    ],
    numberSource: 2,
    returnSource: true
  }  
}

const BaseSchema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "mode": {
      "type": "string",
      "pattern": /^(OpenAI-QA|Other)$/
    },
    "timeout": {
      "type": "integer"
    }
  },
  "required": [
    "mode"
  ]
}

const QASchema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "mode": {
      "type": "string"
    },
    "timeout": {
      "type": "integer"
    },
    "contextName": {
      "type": "string"
    },
    "modelName": {
      "type": "string"
    },
    "modelTokens": {
      "type": "integer"
    },    
    "maxTokens": {
      "type": "integer"
    },
    "promptTemperature": {
      "type": "number"
    },
    "promptId": {
      "type": "number"
    },
    "prompts": {
      "type": "array",
      "items": {
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    },
    "prepromptTemperature": {
      "type": "number"
    },
    "prepromptId": {
      "type": "number"
    },
    "preprompts": {
      "type": "array",
      "items": {
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    },
    "numberSource": {
      "type": "integer"
    },
    "returnSource": {
      "type": "boolean"
    }
  },
  "required": [
    "mode",
    "contextName",
    "modelName",
    "prompts",
    "preprompts",
    "numberSource",
    "returnSource"
  ]
}