import {
  read as readFile,
  write as writeFile
} from './file-database'
import {
  read as readS3,
  write as writeS3
} from './s3-database'

const useS3 = !!process.env.AWS_S3_BUCKET

export const read = useS3 ? readS3 : readFile

export const write = useS3 ? writeS3 : writeFile

