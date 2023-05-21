import {
  Card,
  List,
  ListItem,
  Icon,
  Text,
  Bold,
  Flex,
  Title,
  Footer,
  ButtonInline,
  Block,
  Badge,
} from "@tremor/react"

import MicrosoftFillIcon from "remixicon-react/MicrosoftFillIcon"
import { Square3Stack3DIcon } from "@heroicons/react/24/outline"

export default () => {
  return (
    <Card shadow={false}>
      <Title>Software Integrations</Title>
      <Text>
        Retake pulls real-time expense data from 30+ accounting and ERP systems.
      </Text>
      <List marginTop="mt-4">
        <ListItem>
          <Flex
            justifyContent="justify-start"
            spaceX="space-x-4"
            truncate={true}
          >
            <Icon
              variant="light"
              icon={MicrosoftFillIcon}
              size="md"
              color="blue"
            />
            <Block truncate={true}>
              <Text truncate={true}>
                <Bold>Microsoft Dynamics 365</Bold>
              </Text>
              <Text truncate={true}>ERP</Text>
            </Block>
          </Flex>
          <Badge color="green" text="Connected" />
        </ListItem>
      </List>
      <Footer>
        <ButtonInline
          size="sm"
          text="Add Integration"
          icon={Square3Stack3DIcon}
          iconPosition="right"
        />
      </Footer>
    </Card>
  )
}
