const obj = {};
export function getKey(v, k = '') {
  // tslint:disable-next-line:forin
  for (const key in v) {
    let rKey = k + key;
    if (k.indexOf('[') !== -1) {
      rKey += ']';
    }
    if (v[key] instanceof Array) {
      this.getKey(v[key], `${rKey}[`);
    } else {
      obj[rKey] = v[key];
      // formData.append(rKey, v[key]);
    }
  }
  return obj;
}
