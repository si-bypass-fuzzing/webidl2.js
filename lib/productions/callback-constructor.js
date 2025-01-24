// https://github.com/mozilla/gecko-webidl/blob/main/lib/index.js

import { Base } from "./base.js";
import { argument_list, unescape, autoParenter } from "./helpers.js";
import { Type } from "./type.js";

/** Class for representing `callback constructor`. */
export class CallbackConstructor extends Base {
  /**
   * @param {import("../tokeniser.js").Tokeniser} tokeniser
   */
  static parse(tokeniser) {
    const { position } = tokeniser;
    const base = tokeniser.consume("callback");
    if (!base) {
      return;
    }
    const tokens = { base };
    tokens.constructor_ = tokeniser.consume("constructor");
    if (!tokens.constructor_) {
      tokeniser.unconsume(position);
      return;
    }
    const ret = autoParenter(
      new CallbackConstructor({ source: tokeniser.source, tokens })
    );
    tokens.name =
      tokeniser.consumeKind("identifier") ||
      tokeniser.error("Callback lacks a name");
    tokeniser.current = ret.this;
    tokens.assign =
      tokeniser.consume("=") ||
      tokeniser.error("Callback constructor lacks an assignment");
    ret.idlType =
      Type.parse(tokeniser, "return-type") ||
      tokeniser.error("Callback constructor lacks a return type");
    tokens.open =
      tokeniser.consume("(") ||
      tokeniser.error("Callback constructor lacks parentheses for arguments");
    ret.arguments = argument_list(tokeniser);
    tokens.close =
      tokeniser.consume(")") ||
      tokeniser.error("Unterminated callback constructor");
    tokens.termination =
      tokeniser.consume(";") ||
      tokeniser.error("Unterminated callback constructor, expected `;`");
    return ret.this;
  }

  get name() {
    return unescape(this.tokens.name.value);
  }

  get type() {
    return "callback constructor";
  }

  /** @param {import('../writer.js').Writer} w */
  write(w) {
    return w.ts.definition(
      w.ts.wrap([
        this.extAttrs.write(w),
        w.token(this.tokens.base),
        w.token(this.tokens.constructor_),
        w.name_token(this.tokens.name),
        w.token(this.tokens.assign),
        w.ts.type(this.idlType.write(w)),
        w.token(this.tokens.open),
        ...this.arguments.map((arg) => arg.write(w)),
        w.token(this.tokens.close),
        w.token(this.tokens.termination),
      ]),
      { data: this },
    );
  }
}
