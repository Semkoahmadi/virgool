import { MulterFile } from "src/common/utils/multer.util"

export type ProfileImage = {
    profile_image:MulterFile[],
    bg_image:MulterFile[],
}