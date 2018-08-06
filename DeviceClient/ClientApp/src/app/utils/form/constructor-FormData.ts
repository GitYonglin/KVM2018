const fd = new FormData();
export function getFormData(v, k = '') {
  // tslint:disable-next-line:forin
  for (const key in v) {
    let rKey = k + key;
    if (k[k.length - 1] === '[') {
      rKey += ']';
    }
    console.log(v[key]);
    if (v[key]) {
      switch (true) {
        case v[key].constructor === Array:
        getFormData(v[key], `${rKey}[`);
        break;
        case v[key].constructor === Object:
        getFormData(v[key], `${rKey}.`);
        break;
        case v[key].constructor === Date:
        fd.append(rKey, v[key].toString().replace('GMT+0800 (中国标准时间)', ''));
        break;
      default:
      fd.append(rKey, v[key]);
      break;
    }
  }
  }
  return fd;
}


function formDataArray(data) {
  const r = [];
  data.forEach((item, index) => {
    r.push({value: item, index: index});
  });
  return r;
}

export function newFormData(data): FormData {
  const formData = new FormData();
  // tslint:disable-next-line:forin
  for (const key in data) {
    switch (true) {
      case data[key] instanceof Date:
        formData.append(key, data[key].toString().replace('GMT+0800 (中国标准时间)', ''));
        break;
      case data[key] instanceof Array:
        formDataArray(data[key]).forEach(e => {
          console.log(`${key}[${e.index}]`, e.value);
          formData.append(`${key}[${e.index}]`, e.value);
        });
        break;
      default:
        formData.append(key, data[key]);
        break;
    }
  }
  return formData;
}

export function upDataFormData(data, oldData): FormData {
  const formData = new FormData();
  // tslint:disable-next-line:forin
  for (const key in data) {
    if (data[key] !== oldData[key]) {
      switch (true) {
        case data[key] instanceof Date:
          formData.append(key, data[key].toString().replace('GMT+0800 (中国标准时间)', ''));
          break;
        case data[key] instanceof Array:
          formDataArray(data[key]).forEach(e => {
            formData.append(`${key}[${e.index}]`, e.value);
          });
          break;
        default:
          formData.append(key, data[key]);
          break;
      }
    }
  }
  return formData;
}
