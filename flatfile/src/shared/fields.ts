import {
  NumberField,
  TextField,
  makeField,
  Message,
  BooleanField,
} from "@flatfile/configure"

const RequiredTextField = makeField(TextField(), {
  required: true,
  validate: (val: string) => {
    if (val === null || val === undefined || val === "") {
      return [new Message("This field cannot be empty", "error", "validate")]
    }
  },
})

const RequiredNumberField = makeField(NumberField(), {
  required: true,
  validate: (val: number) => {
    if (val === null || val === undefined) {
      return [new Message("This field cannot be empty", "error", "validate")]
    }
  },
})

const RequiredBooleanField = makeField(BooleanField(), {
  required: true,
  validate: (val: boolean) => {
    if (val === null || val === undefined) {
      return [new Message("This field cannot be empty", "error", "validate")]
    }
  },
})

export { RequiredTextField, RequiredNumberField, RequiredBooleanField }
