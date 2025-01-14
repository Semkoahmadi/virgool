export const createSlug = (str: string) => {
  return str
    .replace(/[ءأإ\.\+\-_)(!@#$%^&*?:;''"><`~»«ءأ]+/g, '')
    ?.replace(/[\s]+/g, '-');
};

export const randomId = () => Math.random().toString(36).substring(2)
