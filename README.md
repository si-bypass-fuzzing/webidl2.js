
Installation
============

Just the usual. For Node:

    npm install webidl2
    
In the browser:

    <script src='webidl2.js'></script>

Documentation
=============

The API to WebIDL2 is trivial: you parse a string of WebIDL and it returns a syntax tree.

Parsing
-------
In Node, that happens with:

    var WebIDL2 = require("webidl2");
    var tree = WebIDL2.parse("string of WebIDL");

In the browser:

    <script src='webidl2.js'></script>
    <script>
      var tree = WebIDL2.parse("string of WebIDL");
    </script>

Errors
------
When there is a syntax error in the WebIDL, it throws an exception object with the following
properties:

* `message`: the error message
* `line`: the line at which the error occurred.
* `input`: a short peek at the text at the point where the error happened
* `tokens`: the five tokens at the point of error, as understood by the tokeniser
  (this is the same content as `input`, but seen from the tokeniser's point of view)

The exception also has a `toString()` method that hopefully should produce a decent
error message.

AST (Abstract Syntax Tree)
--------------------------
The `parse()` method returns a tree object representing the parse tree of the IDL.
Comment and white space are not represented in the AST.

The root of this object is always an array of definitions (where definitions are
any of interfaces, exceptions, callbacks, etc. — anything that can occur at the root
of the IDL).

### IDL Type

This structure is used in many other places (method return types, argument types, etc.).
It captures a WebIDL type with a number of options. Types look like this and are typically
attached to a field called `idlType`:

    {
        "sequence": false,
        "nullable": false,
        "array": false,
        "union": false,
        "idlType": "void"
    }

Where the fields are as follows:

* `sequence`: Boolean indicating whether this is a sequence or not.
* `nullable`: Boolean indicating whether this is nullable or not.
* `array`: Either `false` to indicate that it is not an array, or a number for the level of
  array nesting.
* `union`: Boolean indicating whether this is a union type or not.
* `idlType`: Can be different things depending on context. In most cases, this will just
  be a string with the type name. But the reason this field isn't called "typeName" is
  because it can take more complex values. If the type is a union, then this contains an
  array of the types it unites. If it is a sequence, it contains an IDL type description
  for the type in the sequence.

### Interface
Interfaces look like this:

    {
        "type": "interface",
        "name": "Animal",
        "partial": false,
        "members": [...],
        "inheritance": null,
        "extAttrs": [...]
    },
    {
        "type": "interface",
        "name": "Human",
        "partial": false,
        "members": [...],
        "inheritance": "Animal",
        "extAttrs": [...]
    }

The fields are as follows:

* `type`: Always "interface".
* `name`: The name of the interface
* `partial`: A boolean indicating whether it's a partial interface.
* `members`: An array of interface members (attributes, methods, etc.). Empty if there are none.
* `inheritance`: A string giving the name of an interface this one inherits from, `null` otherwise.
  **NOTE**: In v1 this was an array, but multiple inheritance is no longer supported so this didn't make
  sense.
* `extAttrs`: A list of [extended attributes][extended-attributes].

### Callback Interfaces

These are captured by the same structure as [Interfaces][interfaces] except that
their `type` field is "callback interface".

### Callback

A callback looks like this:

  {
      "type": "callback",
      "name": "AsyncOperationCallback",
      "idlType": {
          "sequence": false,
          "nullable": false,
          "array": false,
          "union": false,
          "idlType": "void"
      },
      "arguments": [...],
      "extAttrs": []
  }

The fields are as follows:

* `type`: Always "callback".
* `name`: The name of the callback.
* `idlType`: An [IDL Type][idl-type] describing what the callback returns.
* `arguments`: A list of [arguments][arguments], as in function paramters.
* `extAttrs`: A list of [extended attributes][extended-attributes].

### Dictionary

A dictionary looks like this:

    {
        "type": "dictionary",
        "name": "PaintOptions",
        "partial": false,
        "members": [
            {
                "type": "field",
                "name": "fillPattern",
                "idlType": {
                    "sequence": false,
                    "nullable": true,
                    "array": false,
                    "union": false,
                    "idlType": "DOMString"
                },
                "extAttrs": [],
                "default": {
                    "type": "string",
                    "value": "black"
                }
            }
        ],
        "inheritance": null,
        "extAttrs": []
    }

The fields are as follows:

* `type`: Always "dictionary".
* `name`: The dictionary name.
* `partial`: Boolean indicating whether it's a partial dictionary.
* `members`: An array of members (see below).
* `inheritance`: A string indicating which dictionary is being inherited from, `null` otherwise.
* `extAttrs`: A list of [extended attributes][extended-attributes].

All the members are fields as follows:

* `type`: Always "field".
* `name`: The name of the field.
* `idlType`: An [IDL Type][idl-type] describing what field's type.
* `extAttrs`: A list of [extended attributes][extended-attributes].
* `default`: A [default value][default-and-const-values], absent if there is none.

### Exception

An exception looks like this:

    {
        "type": "exception",
        "name": "HierarchyRequestError",
        "members": [
            {
                "type": "field",
                "name": "code",
                "idlType": {
                    "sequence": false,
                    "nullable": false,
                    "array": false,
                    "union": false,
                    "idlType": "unsigned short"
                },
                "extAttrs": []
            }
        ],
        "inheritance": "DOMException",
        "extAttrs": []
    }

The fields are as follows:

* `type`: Always "exception".
* `name`: The exception name.
* `members`: An array of members (constants or fields, where fields are described below).
* `inheritance`: A string indicating which exception is being inherited from, `null` otherwise.
* `extAttrs`: A list of [extended attributes][extended-attributes].

Members that aren't [constants][constants] have the following fields:

* `type`: Always "field".
* `name`: The field's name.
* `idlType`: An [IDL Type][idl-type] describing what field's type.
* `extAttrs`: A list of [extended attributes][extended-attributes].

### Enum

An enum looks like this:

    {
        "type": "enum",
        "name": "MealType",
        "values": [
            "rice",
            "noodles",
            "other"
        ],
        "extAttrs": []
    }

The fields are as follows:

* `type`: Always "enum".
* `name`: The enum's name.
* `value`: An array of values (strings).
* `extAttrs`: A list of [extended attributes][extended-attributes].

### Typedef

A typedef looks like this:

    {
        "type": "typedef",
        "typeExtAttrs": [],
        "idlType": {
            "sequence": true,
            "nullable": false,
            "array": false,
            "union": false,
            "idlType": {
                "sequence": false,
                "nullable": false,
                "array": false,
                "union": false,
                "idlType": "Point"
            }
        },
        "name": "PointSequence",
        "extAttrs": []
    }

The fields are as follows:

* `type`: Always "typedef".
* `name`: The typedef's name.
* `idlType`: An [IDL Type][idl-type] describing what typedef's type.
* `extAttrs`: A list of [extended attributes][extended-attributes].
* `typeExtAttrs`: A list of [extended attributes][extended-attributes] that apply to the 
type rather than to the typedef as a whole.

### Implements

### Arguments
### Extended Attributes

### Default and Const Values

Dictionary fields and method arguments can take default values, and constants take
values, all of which have the following fields:

* `type`: One of string, number, boolean, null, Infinity, or NaN.

For string, number, and boolean:

* `value`: The value of the given type.

For Infinity:

* `negative`: Boolean indicating whether this is negative Infinity or not.


Testing
=======

In order to run the tests you need to ensure that the widlproc submodule inside `test` is
initialised and up to date:

    git submodule init
    git submodule update
    git pull origin master (in the submodule, once in a while)

Running
-------
The test runs with mocha and expect.js. Normally, running mocha in the root directory
should be enough once you're set up.

Coverage
--------
Current test coverage, as documented in `coverage.html`, is 95%. You can run your own
coverage analysis with:

    jscoverage lib lib-cov
    
That will create the lib-cov directory with instrumented code; the test suite knows
to use that if needed. You can then run the tests with:

    JSCOV=1 mocha --reporter html-cov > coverage.html

Note that I've been getting weirdly overescaped results from the html-cov reporter,
so you might wish to try this instead:

    JSCOV=1 mocha  --reporter html-cov | sed "s/&lt;/</g" | sed "s/&gt;/>/g" | sed "s/&quot;/\"/g" > coverage.html

Browser tests
-------------
In order to test in the browser, get inside `test/web` and run `make-web-tests.js`. This
will generate a `browser-tests.html` file that you can open in a browser. As of this
writing tests pass in the latest Firefox, Chrome, Opera, and Safari. Testing on IE
and older versions will happen progressively.

TODO
====

* add some tests to address coverage limitations
* document
* review the test JSONs to for correctness
