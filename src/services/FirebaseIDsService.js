import {firestore} from "../Util/Firebase";


const idsCollection = "IDs";
const idDoc = "eventIds";

const idsDb = firestore.collection(idsCollection);


// IDs

export const getCurrentIds = () => {
  return idsDb.doc(idDoc).get();
}

export const increaseEventId = (id) => {
  let ref = idsDb.doc(idDoc);
  return ref.update({
    id: ++id
  });
}
