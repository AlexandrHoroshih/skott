import { notify } from "@/store/store";
import { Button, Menu, rem } from "@mantine/core";
import {
  IconExternalLink,
  IconPlayerPlay,
  IconPlayerStop,
  IconRotate2,
  IconSettingsAutomation,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react";
import React from "react";
import { Network } from "vis-network";

export function ActionMenu({
  network,
  initNetwork,
  graphMode,
  onGraphModeChange,
}: {
  network: Network | undefined;
  graphMode: "full" | "grouped";
  onGraphModeChange: (mode: "full" | "grouped") => void;
  initNetwork: () => void;
}) {
  const [simulation, setSimulation] = React.useState(false);

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 1,
      }}
    >
      <Menu trigger="hover" openDelay={100} closeDelay={400}>
        <Menu.Target>
          <Button variant="gradient" leftIcon={<IconSettingsAutomation />}>
            Graph Actions
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Network</Menu.Label>
          <Menu.Item
            onClick={() => {
              network?.destroy();
              initNetwork();
              setSimulation(true);
            }}
            icon={<IconRotate2 style={{ width: rem(14), height: rem(14) }} />}
          >
            Redraw
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              if (simulation) {
                network?.stopSimulation();
                setSimulation(false);
              } else {
                network?.startSimulation();
                setSimulation(true);
              }
            }}
            icon={
              simulation ? (
                <IconPlayerStop style={{ width: rem(14), height: rem(14) }} />
              ) : (
                <IconPlayerPlay style={{ width: rem(14), height: rem(14) }} />
              )
            }
          >
            {simulation ? "Stop" : "Start"} simulation
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              if (graphMode === "full") {
                onGraphModeChange("grouped");
              } else {
                onGraphModeChange("full");
              }
            }}
            icon={
              graphMode === "full" ? (
                <IconToggleLeft style={{ width: rem(14), height: rem(14) }} />
              ) : (
                <IconToggleRight style={{ width: rem(14), height: rem(14) }} />
              )
            }
          >
            Use {graphMode === "full" ? "grouped" : "full"} graph
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>Graph configuration</Menu.Label>
          <Menu.Item
            onClick={() => {
              notify({
                action: "open_sidebar_menu",
                payload: { menu: "graph_configuration" },
              });
            }}
            icon={
              <IconExternalLink style={{ width: rem(14), height: rem(14) }} />
            }
          >
            Open
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
