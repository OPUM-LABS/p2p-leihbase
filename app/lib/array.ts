export const equalValues = (arrA: Array<any>, arrB: Array<any>) => {
    const isLengthEqual = arrA.length === arrB.length
    if (!isLengthEqual) {return false;}

    let isEqual = true;
    for (let i = 0; i < arrA.length; i++) {
       if (arrA[i] !== arrB[i]) {
          return false;
       }
    }
    return isEqual;
}