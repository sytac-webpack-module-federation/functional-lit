import { LitElement } from "lit";

let currentComponent = {};

export function define({ tag, component: CustomFuntionalComponent }) {
    class CustomComponent extends LitElement {
        constructor() {
            super();
            this.hookIndex = 0;
            this.hooks = {};
        }

        render() {
            // get all attributes
            const attributes = Array.from(this.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
            }, {});

            this.hookIndex = 0;
            currentComponent = this;
            const functionalComponent = () => CustomFuntionalComponent({
                ...attributes,
                children: this.innerHTML
            });
            currentComponent = null;

            return functionalComponent();
        }
    }

    window.customElements.define(tag, CustomComponent);
}

export function useState(initialState) {
    const component = currentComponent;
    const hookIndex = component.hookIndex++;
    const hookName = `hook-${hookIndex}`;

    if (!component.hooks[hookName]) {
        component.hooks[hookName] = initialState;
    }

    const setState = (newState) => {
        const value = typeof newState === 'function' ? newState(component.hooks[hookName]) : newState;
        component.hooks[hookName] = value;
        component.requestUpdate();
    };

    return [component.hooks[hookName], setState];
}

export function useEffect(effect, dependencies) {
    const component = currentComponent;
    const hookIndex = component.hookIndex++;
    const hookName = `hook-${hookIndex}`;

    const prevDeps = component.hooks[hookName]?.dependencies;
    const hasChanged = !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged) {
        if (component.hooks[hookName]?.cleanup) {
            component.hooks[hookName].cleanup();
        }
        const cleanup = effect();
        component.hooks[hookName] = { dependencies, cleanup };
    }

    component.addController({
        hostDisconnected() {
            if (component.hooks[hookName]?.cleanup) {
                component.hooks[hookName].cleanup();
            }
        }
    });
}

export function useMemo(calculation, dependencies) {
    const component = currentComponent;
    const hookIndex = component.hookIndex++;
    const hookName = `hook-${hookIndex}`;

    const prevDeps = component.hooks[hookName]?.dependencies;
    const hasChanged = !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged) {
        component.hooks[hookName] = {
            value: calculation(),
            dependencies,
        };
    }

    return component.hooks[hookName].value;
}