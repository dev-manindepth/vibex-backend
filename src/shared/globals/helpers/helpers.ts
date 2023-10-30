export class Helpers {
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
      .join(' ');
  }
  static lowerCase(str: string): string {
    return str.toLowerCase();
  }
  static generateRandomIntegers(integerLength: number): number {
    const characters = '0123456789';
    let results = '';
    const charactersLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      results += characters.charAt(Math.random() * charactersLength);
    }
    return parseInt(results, 10);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parseJSON(data: string): any {
    try {
      return JSON.parse(data);
    } catch (error) {
      return data;
    }
  }
  static isDataURL(image: string): boolean {
    const dataUrlRegex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
    return dataUrlRegex.test(image);
  }
  static shuffle(list: string[]): string[] {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }
  static escapeRegex(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
}
