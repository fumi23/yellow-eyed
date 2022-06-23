type OkResult<T> = {
  result: 'ok'
  value: T
}
type ErrorResult = {
  result: 'error'
  code: string
  description: string
}
type Result<T> = OkResult<T> | ErrorResult

const Result = {
  map<T, U>(res: Result<T>, callback: (_: T) => U): Result<U> {
    if (res.result === 'ok') {
      return { result: 'ok', value: callback(res.value) }
    } else {
      return res
    }
  }
}

export default Result
