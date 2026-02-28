// /packages/core/dev/utils/jsxAst.js
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import generateModule from "@babel/generator";
import * as t from "@babel/types";

/**
 * Normalize Babel packages that may be CJS under the hood.
 */
const traverse = (traverseModule && traverseModule.default) ? traverseModule.default : traverseModule;
const generate = (generateModule && generateModule.default) ? generateModule.default : generateModule;

function getJsxAttrStringValue(attr) {
  if (!t.isJSXAttribute(attr)) return null;
  if (!attr.value) return null;

  // data-axon-id="123"
  if (t.isStringLiteral(attr.value)) return attr.value.value;

  // data-axon-id={"123"} or {123}
  if (t.isJSXExpressionContainer(attr.value)) {
    const expr = attr.value.expression;
    if (t.isStringLiteral(expr)) return expr.value;
    if (t.isNumericLiteral(expr)) return String(expr.value);
  }

  return null;
}

/**
 * Get className from the first JSX opening element (page root).
 * Returns an empty string if not present or not a string literal.
 */
export function getRootClassName(code) {
  if (typeof code !== "string") return "";

  try {
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    let className = "";

    traverse(ast, {
      JSXOpeningElement(path) {
        const attrs = path.node.attributes;
        const classAttr = attrs.find(
          (attr) =>
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name, { name: "className" }) &&
            t.isStringLiteral(attr.value)
        );

        className = classAttr ? classAttr.value.value : "";
        path.stop();
      },
    });

    return className;
  } catch (err) {
    console.error("Error getting root className:", err);
    return "";
  }
}

/**
 * Get className from a specific element by data-axon-id
 */
export function getClassNameFromElement(code, elementId) {
  if (typeof code !== "string") return "";
  
  try {
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    let className = "";

    traverse(ast, {
      JSXOpeningElement(path) {
        const attrs = path.node.attributes;
        const axonIdAttr = attrs.find((attr) => {
          if (!t.isJSXAttribute(attr)) return false;
          if (!t.isJSXIdentifier(attr.name, { name: "data-axon-id" })) return false;
          const val = getJsxAttrStringValue(attr);
          return val !== null && val === elementId;
        });

        if (axonIdAttr) {
          const classAttr = attrs.find(
            (attr) =>
              t.isJSXAttribute(attr) &&
              t.isJSXIdentifier(attr.name, { name: "className" }) &&
              t.isStringLiteral(attr.value)
          );
          className = classAttr ? classAttr.value.value : "";
          path.stop();
        }
      },
    });

    return className;
  } catch (err) {
    console.error("Error getting className from element:", err);
    return "";
  }
}

/**
 * Get all elements with data-axon-id and their classNames
 */
export function getAllElements(code) {
  if (typeof code !== "string") return {};
  
  try {
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    const elements = {};

    traverse(ast, {
      JSXOpeningElement(path) {
        const attrs = path.node.attributes;
        const axonIdAttr = attrs.find((attr) => {
          if (!t.isJSXAttribute(attr)) return false;
          if (!t.isJSXIdentifier(attr.name, { name: "data-axon-id" })) return false;
          return getJsxAttrStringValue(attr) !== null;
        });

        if (axonIdAttr) {
          const elementId = getJsxAttrStringValue(axonIdAttr);
          if (!elementId) return;
          const classAttr = attrs.find(
            (attr) =>
              t.isJSXAttribute(attr) &&
              t.isJSXIdentifier(attr.name, { name: "className" }) &&
              t.isStringLiteral(attr.value)
          );
          elements[elementId] = classAttr ? classAttr.value.value : "";
        }
      },
    });

    return elements;
  } catch (err) {
    console.error("Error getting all elements:", err);
    return {};
  }
}

/**
 * Update className for a specific element by data-axon-id
 */
export function updateClassNameInElement(code, elementId, newClassName) {
  if (typeof code !== "string") {
    throw new Error("JSX code must be a string");
  }
  if (typeof elementId !== "string") {
    throw new Error("elementId must be a string");
  }
  if (typeof newClassName !== "string") {
    throw new Error("newClassName must be a string");
  }

  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  if (typeof traverse !== "function") {
    throw new Error("Babel traverse is not available as a function");
  }

  let updated = false;

  traverse(ast, {
    JSXOpeningElement(path) {
      const attrs = path.node.attributes;
      
      // Find element with matching data-axon-id
      const axonIdAttr = attrs.find((attr) => {
        if (!t.isJSXAttribute(attr)) return false;
        if (!t.isJSXIdentifier(attr.name, { name: "data-axon-id" })) return false;
        const val = getJsxAttrStringValue(attr);
        return val !== null && val === elementId;
      });

      if (axonIdAttr) {
        const classAttrIndex = attrs.findIndex(
          (attr) =>
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name, { name: "className" })
        );

        if (classAttrIndex >= 0) {
          attrs[classAttrIndex].value = t.stringLiteral(newClassName);
        } else {
          attrs.unshift(
            t.jsxAttribute(
              t.jsxIdentifier("className"),
              t.stringLiteral(newClassName)
            )
          );
        }

        updated = true;
        path.stop();
      }
    },
  });

  if (!updated) {
    throw new Error(`No element found with data-axon-id="${elementId}"`);
  }

  if (typeof generate !== "function") {
    throw new Error("Babel generate is not available as a function");
  }

  return generate(ast, { retainLines: true, concise: false }).code;
}

/**
 * Updates or inserts className in the FIRST JSX opening element.
 * Node-only server-side utility.
 */
export function updateClassNameInJsx(code, newClassName) {
  if (typeof code !== "string") {
    throw new Error("JSX code must be a string");
  }
  if (typeof newClassName !== "string") {
    throw new Error("newClassName must be a string");
  }

  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  if (typeof traverse !== "function") {
    throw new Error("Babel traverse is not available as a function");
  }

  let updated = false;

  traverse(ast, {
    JSXOpeningElement(path) {
      if (updated) return;

      const attrs = path.node.attributes;

      const classAttrIndex = attrs.findIndex(
        (attr) =>
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name, { name: "className" })
      );

      if (classAttrIndex >= 0) {
        const classAttr = attrs[classAttrIndex];
        classAttr.value = t.stringLiteral(newClassName);
      } else {
        attrs.unshift(
          t.jsxAttribute(
            t.jsxIdentifier("className"),
            t.stringLiteral(newClassName)
          )
        );
      }

      updated = true;
      path.stop();
    },
  });

  if (!updated) {
    throw new Error("No JSXOpeningElement found to update className");
  }

  if (typeof generate !== "function") {
    throw new Error("Babel generate is not available as a function");
  }

  return generate(ast, { retainLines: true, concise: false }).code;
}

/**
 * Ensure all DOM JSX elements have a stable data-axon-id.
 * - Skips components (Uppercase JSXIdentifiers)
 * - Preserves existing ids
 */
export function ensureAxonIdsInJsx(code) {
  if (typeof code !== "string") {
    throw new Error("JSX code must be a string");
  }

  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  const existing = new Set();

  // Pass 1: collect existing ids
  traverse(ast, {
    JSXOpeningElement(path) {
      const attrs = path.node.attributes;
      const axonAttr = attrs.find(
        (attr) =>
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name, { name: "data-axon-id" })
      );
      if (!axonAttr) return;
      const val = getJsxAttrStringValue(axonAttr);
      if (val) existing.add(val);
    },
  });

  let counter = 1;
  let changed = false;
  const nextId = () => {
    while (existing.has(`axon-${counter}`)) counter += 1;
    const id = `axon-${counter}`;
    counter += 1;
    existing.add(id);
    return id;
  };

  // Pass 2: insert missing ids
  traverse(ast, {
    JSXOpeningElement(path) {
      const name = path.node.name;
      if (!t.isJSXIdentifier(name)) return;

      // Skip components (Uppercase)
      const tag = name.name;
      if (!tag) return;
      const first = tag[0];
      if (first && first === first.toUpperCase()) return;

      const attrs = path.node.attributes;
      const hasAxon = attrs.some(
        (attr) =>
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name, { name: "data-axon-id" })
      );
      if (hasAxon) return;

      attrs.push(
        t.jsxAttribute(
          t.jsxIdentifier("data-axon-id"),
          t.stringLiteral(nextId())
        )
      );
      changed = true;
    },
  });

  const out = generate(ast, { retainLines: true, concise: false }).code;
  return { code: out, changed };
}

/**
 * Remove data-axon-id attributes (keep code clean).
 */
export function stripAxonIdsInJsx(code) {
  if (typeof code !== "string") {
    throw new Error("JSX code must be a string");
  }

  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  let changed = false;

  traverse(ast, {
    JSXOpeningElement(path) {
      const attrs = path.node.attributes;
      const before = attrs.length;
      path.node.attributes = attrs.filter(
        (attr) =>
          !(
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name, { name: "data-axon-id" })
          )
      );
      if (path.node.attributes.length !== before) changed = true;
    },
  });

  const out = generate(ast, { retainLines: true, concise: false }).code;
  return { code: out, changed };
}

function flattenJsxChildrenToElements(children) {
  const out = [];
  for (const child of children || []) {
    if (t.isJSXElement(child)) {
      out.push(child);
      continue;
    }
    if (t.isJSXFragment(child)) {
      out.push(...flattenJsxChildrenToElements(child.children));
    }
  }
  return out;
}

function findFirstJsxElement(ast) {
  let found = null;
  traverse(ast, {
    JSXElement(path) {
      found = path.node;
      path.stop();
    },
  });
  return found;
}

function getClassNameFromOpening(openingElement) {
  const attrs = openingElement.attributes || [];
  const classAttr = attrs.find(
    (attr) =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name, { name: "className" })
  );
  if (!classAttr || !classAttr.value) return "";
  if (t.isStringLiteral(classAttr.value)) return classAttr.value.value;
  if (t.isJSXExpressionContainer(classAttr.value) && t.isStringLiteral(classAttr.value.expression)) {
    return classAttr.value.expression.value;
  }
  return "";
}

function setClassNameOnOpening(openingElement, newClassName) {
  const attrs = openingElement.attributes || [];
  const idx = attrs.findIndex(
    (attr) =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name, { name: "className" })
  );

  if (idx >= 0) {
    attrs[idx].value = t.stringLiteral(newClassName);
  } else {
    attrs.unshift(
      t.jsxAttribute(t.jsxIdentifier("className"), t.stringLiteral(newClassName))
    );
  }
}

function getJsxElementAtPath(rootEl, path) {
  let current = rootEl;
  for (const idx of path || []) {
    const kids = flattenJsxChildrenToElements(current.children);
    const next = kids[idx];
    if (!next) return null;
    current = next;
  }
  return current;
}

function upsertStringAttribute(openingElement, name, value) {
	const attrs = openingElement.attributes || [];
	const idx = attrs.findIndex(
		(attr) =>
			t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name })
	);

	if (value === null || value === undefined || value === "") {
		// remove
		if (idx >= 0) attrs.splice(idx, 1);
		return;
	}

	const attr = t.jsxAttribute(t.jsxIdentifier(name), t.stringLiteral(String(value)));
	if (idx >= 0) attrs[idx] = attr;
	else attrs.push(attr);
}

export function updateAttributesAtElementPath(code, elementPath, attributes) {
	if (typeof code !== "string") throw new Error("JSX code must be a string");
	if (!Array.isArray(elementPath)) throw new Error("elementPath must be an array");
	if (!attributes || typeof attributes !== "object") throw new Error("attributes must be an object");

	const ast = parse(code, {
		sourceType: "module",
		plugins: ["jsx"],
	});

	const root = findFirstJsxElement(ast);
	if (!root) throw new Error("No JSXElement found");

	const el = getJsxElementAtPath(root, elementPath);
	if (!el) throw new Error("No JSXElement found for elementPath");

	for (const [name, value] of Object.entries(attributes)) {
		upsertStringAttribute(el.openingElement, name, value);
	}

	return generate(ast, { retainLines: true, concise: false }).code;
}

/**
 * Element path is an array of DOM child indices relative to the page container.
 * We mirror this against the JSXElement tree (flattening fragments, ignoring text).
 */
export function getClassNameFromElementPath(code, elementPath) {
  if (typeof code !== "string") return "";
  if (!Array.isArray(elementPath)) return "";

  try {
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    const root = findFirstJsxElement(ast);
    if (!root) return "";

    const el = getJsxElementAtPath(root, elementPath);
    if (!el) return "";

    return getClassNameFromOpening(el.openingElement);
  } catch (err) {
    console.error("Error getting className from elementPath:", err);
    return "";
  }
}

export function updateClassNameAtElementPath(code, elementPath, newClassName) {
  if (typeof code !== "string") {
    throw new Error("JSX code must be a string");
  }
  if (!Array.isArray(elementPath)) {
    throw new Error("elementPath must be an array");
  }
  if (typeof newClassName !== "string") {
    throw new Error("newClassName must be a string");
  }

  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  const root = findFirstJsxElement(ast);
  if (!root) throw new Error("No JSXElement found");

  const el = getJsxElementAtPath(root, elementPath);
  if (!el) throw new Error("No JSXElement found for elementPath");

  setClassNameOnOpening(el.openingElement, newClassName);

  return generate(ast, { retainLines: true, concise: false }).code;
}
