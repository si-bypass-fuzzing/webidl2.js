// https://github.com/mozilla/gecko-webidl/blob/main/lib/index.js

import { Base } from "./base.js";
import { unescape, autoParenter } from "./helpers.js";

/** Class for representing interfaces that lack a body. */
export class BodylessInterface extends Base {
  /**
   * @param {import("../tokeniser.js").Tokeniser} tokeniser
   * @param {import("../tokeniser.js").Token} base
   */
  static parse(tokeniser) {
    const { position } = tokeniser;
    const base = tokeniser.consume("interface");
    if (!base) {
      return;
    }

    const tokens = { base };
    const ret = autoParenter(
      new BodylessInterface({ source: tokeniser.source, tokens }),
    );
    tokens.name = tokeniser.consumeKind("identifier");
    if (!tokens.name) {
      tokeniser.unconsume(position);
      return;
    }

    tokeniser.current = ret.this;
    tokens.termination = tokeniser.consume(";");
    if (!tokens.termination) {
      tokeniser.unconsume(position);
      return;
    }
    return ret.this;
  }

  get name() {
    return unescape(this.tokens.name.value);
  }

  get type() {
    return "bodyless interface";
  }

  /** @param {import('../writer.js').Writer} w */
  write(w) {
    return w.ts.definition(
      w.ts.wrap([
        w.token(this.tokens.base),
        w.token(this.tokens.name),
        w.token(this.tokens.termination),
      ]),
      { data: this },
    );
  }
}
