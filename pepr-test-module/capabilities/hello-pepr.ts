import {
  Capability,
  K8s,
  a,
} from "pepr";

/**
 *  The HelloPepr Capability is an example capability to demonstrate some general concepts of Pepr.
 *  To test this capability you run `pepr dev`and then run the following command:
 *  `kubectl apply -f capabilities/hello-pepr.samples.yaml`
 */
export const HelloPepr = new Capability({
  name: "hello-pepr",
  description: "A simple example capability to show how things work."
});

// Use the 'When' function to create a new action, use 'Store' to persist data
const { When } = HelloPepr;
const deletePod = async (name: string) => {
  await K8s(a.Pod).InNamespace("pepr-demo").Delete(name);
};

When(a.Pod)
  .IsCreatedOrUpdated()
  .InNamespace("pepr-demo")
  .Reconcile(async instance => {
    await deletePod(instance.metadata.name);
  });
