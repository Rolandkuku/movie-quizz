// @flow
function setName(name: string) {
  try {
    localStorage.setItem("name", name);
  } catch (error) {
    throw new Error(error);
  }
}

function unsetName() {
  try {
    localStorage.removeItem("name");
  } catch (error) {
    throw new Error(error);
  }
}

function getName() {
  try {
    return localStorage.getItem("name");
  } catch (error) {
    throw new Error(error);
  }
}

export { setName, getName, unsetName };
