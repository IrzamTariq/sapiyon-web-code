import { Address, Firm, UploadedFile, User } from "../../types";
import { s3BucketURL } from "../helpers";

function getUserProfile(user = {} as User) {
  let result = {};
  const {
    _id: USER_ID,
    email,
    fullName,
    firm = {} as Firm,
    phone,
    createdAt,
  } = user;

  const {
    businessName,
    taxIdNumber,
    taxOffice,
    address = {} as Address,
    logoImgUrl,
  } = firm;
  const { formatted } = address;

  let $avatar = "";

  if (logoImgUrl) {
    $avatar = s3BucketURL({ url: logoImgUrl } as UploadedFile);
  }
  result = {
    USER_ID,
    $name: fullName,
    $email: email,
    $phone: phone,
    $created: createdAt,
    Address: formatted,
    $avatar,
    "Company Name": businessName,
    "Tax Office": taxOffice,
    "Tax ID": taxIdNumber,
  };

  return result;
}

export default getUserProfile;
