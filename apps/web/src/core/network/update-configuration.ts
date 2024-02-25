import { NetworkLayout } from "@/store/state";
import { AppStore } from "@/store/store";

export function updateConfiguration(appStore: AppStore) {
  return function (params: NetworkLayout) {
    appStore.dispatch({
      action: "update_configuration",
      payload: params,
    });
  };
}

export function toggleGraph(appStore: AppStore) {
  return function (params: { graph: "full" | "grouped" }) {
    appStore.dispatch(
      {
        action: "toggle_graph",
        payload: params.graph,
      },
      { notify: true }
    );
  };
}
