import { ParseFilePipe, UploadedFiles } from "@nestjs/common"

export function UploadOptionalFiles(){
    return UploadedFiles(
        new ParseFilePipe({
            fileIsRequired: false,
            validators: [],
          })
    )   
}