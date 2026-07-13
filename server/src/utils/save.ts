import fs from 'fs'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'

class Save {
  constructor() { }
  type(val: any): string | undefined {
    if (typeof val === 'string') {
      return 'string';
    }
    if (typeof val === 'number') {
      return 'number';
    }
    if (Array.isArray(val)) {
      return 'array';
    }
    if (Object.prototype.toString.call(val) === '[object Object]') {
      return 'object';
    }
  }
  formatString(str: string): string {
    return `'${str}'`;
  }
  formatNumber(num: number): string {
    return `${num}`;
  }
  formatArray(arr: Array<any>): string {
    const list = arr.map((item: any) => this.format(item));
    return `[${list.join(',')}]`;
  }
  formatObject(obj: Object): string {
    const objItems = Object.entries(obj).map(([key, value]) => `${key}: ${this.format(value)}`);
    return `{${objItems.join(',')}}`;
  }
  format(item: any): string {
    const type = this.type(item);
    if (type === 'string') {
      return this.formatString(item);
    }
    if (type === 'number') {
      return this.formatNumber(item);
    }
    if (type === 'array') {
      return this.formatArray(item);
    }
    if (type === 'object') {
      return this.formatObject(item);
    }
    return item;
  }
  createDir(dir: any): string | null {
    function formatDir(dirname: string) {
      let dir = dirname;
      if (!path.isAbsolute(dirname)) {
        dir = path.resolve(__dirname, dirname);
      }
      const parsed = path.parse(dir);
      if (!parsed.ext) {
        // 当前dir为文件地址
        dir = path.resolve(parsed.dir, parsed.base);
      } else {
        // 当前dir为目录
        dir = path.resolve(parsed.dir);
      }
      return dir;
    }
    function mkdirSync(dirname: string): boolean {
      let fullPath = dirname;

      if (fs.existsSync(fullPath)) {
        return true;
      }
      if (mkdirSync(path.dirname(fullPath))) {
        fs.mkdirSync(fullPath);
        return true;
      }
      return false;
    }
    try {
      mkdirSync(formatDir(dir));
      const fullDir = formatDir(dir);
      return fullDir;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  saveImage({ base64, dir }: { base64: string, dir: string }) {
    const pngData = base64.replace(/^data:image\/png;base64,/, '');
    const uid = uuidv4();
    const fullPath = this.createDir(dir);
    fs.writeFileSync(fullPath + `/${uid}.png`, pngData, 'base64');
    return uid;
  }
  saveArticle({ item, dir = '', name }: { item: any, dir: string, name: string }) {
    // 数据检查
    if (this.type(item) !== 'object') {
      throw new Error(`所要保存的数据不是Object类型!`);
    }
    if (!name) {
      throw new Error(`文件名不可为空!`);
    }
    const fullPath = this.createDir(dir);
    try {
      const props = Object.entries(item).map(([key, value]) => `const ${key} = ${this.format(value)}`);
      const exports = `module.exports = {${Object.keys(item).join(',')}}`;
      props.push(exports);
      fs.writeFileSync(fullPath + name, props.join(';'));
    } catch (e) {
      console.log(e);
      throw new Error(`保存数据失败!`);
    }
  }
}

export default Save;
