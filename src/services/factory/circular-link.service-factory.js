 const createDetectCircularLink = ({ model, linkField }) => {

  return async ({ sourceId, targetIds }) => {

    const stack = Array.isArray(targetIds) ? [...targetIds] : [];
    const visited = new Set();

    while (stack.length) {

      const current = stack.pop();
      const currentId = String(current);

      if (currentId === String(sourceId)) {
        return true;
      }

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const entity = await model.findById(currentId, { [linkField]: 1 }).lean();

      const links = entity?.[linkField];

      if (Array.isArray(links) && links.length) {
        stack.push(...links.map(String));
      }
    }

    return false;
  };
};

const createDetectCircularLinkForSingleRef = ({ model, linkField }) => {

  return async ({ sourceId, targetId }) => {

    if (!targetId) return false;

    let currentId = String(targetId);
    const source = String(sourceId);
    const visited = new Set();

    while (currentId) {

      if (currentId === source) {
        return true; // circular detected
      }

      if (visited.has(currentId)) break;
      visited.add(currentId);

      const entity = await model.findById(currentId, { [linkField]: 1 }).lean();

      if (!entity || !entity[linkField]) {
        break;
      }

      currentId = String(entity[linkField]);
    }

    return false;
  };
};

module.exports = {
  createDetectCircularLink,
  createDetectCircularLinkForSingleRef
}