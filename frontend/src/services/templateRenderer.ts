import Handlebars from 'handlebars';
import Mustache from 'mustache';
import ejs from 'ejs';

import type { TemplateEngine } from '../types/template';

export function renderTemplate(engine: TemplateEngine, template: string, data: unknown): string {
  switch (engine) {
    case 'handlebars':
      return Handlebars.compile(template)(data as Record<string, unknown>);
    case 'mustache':
      return Mustache.render(template, data as Record<string, unknown>);
    case 'ejs':
      return ejs.render(template, data as Record<string, unknown>);
    default: {
      const exhaustiveCheck: never = engine;
      throw new Error(`Unknown template engine: ${exhaustiveCheck}`);
    }
  }
}
