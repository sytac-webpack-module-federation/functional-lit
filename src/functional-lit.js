import { LitElement } from "lit";

let currentComponent = {};
let hookIndex = 0;

export function define({ tag, component: CustomFuntionalComponent }) {
    class CustomComponent extends LitElement {
        render() {
            // get all attributes
            const attributes = Array.from(this.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
            }, {});

            const functionalComponent = () => CustomFuntionalComponent({
                ...attributes,
                children: this.innerHTML
            });

            currentComponent = this;
            hookIndex = 0;

            return functionalComponent();
        }
    }

    window.customElements.define(tag, CustomComponent);
}

export function useState(initialState) {
    // Define a unique property name for each state variable
    const propName = `hook-${hookIndex++}`;

    currentComponent[propName] = currentComponent[propName] ?? initialState;

    const setState = (newState) => {
        const currentValue = currentComponent[propName];
        const newValue = typeof newState === 'function' ? newState(currentValue) : newState;

        currentComponent[propName] = newValue;
        currentComponent.requestUpdate();
    };

    return [currentComponent[propName], setState];
}

export function useEffect(effectCallback, dependencies) {
    const effectPropName = `hook-${hookIndex++}`;

    // Initialize or update the dependencies property
    const hasChangedDependencies = currentComponent[effectPropName]
        ? !dependencies.every((dep, i) => dep === currentComponent[effectPropName].dependencies[i])
        : true;

    if (hasChangedDependencies) {
        // Update dependencies
        currentComponent[effectPropName] = {
            dependencies,
            cleanup: undefined, // Placeholder for cleanup function
        };


        // Call the effect callback and store any cleanup function
        const cleanup = effectCallback();
        if (typeof cleanup === 'function') {
            currentComponent[effectPropName].cleanup = cleanup;
        }
    }

    // Integrate with LitElement lifecycle for cleanup
    currentComponent.addController({
        hostDisconnected() {
            if (currentComponent[effectPropName]?.cleanup) {
                currentComponent[effectPropName].cleanup();
            }
        }
    });
}

export function useMemo(calculation, dependencies) {
    const memoPropName = `hook-${hookIndex++}`;

    // Check if the memoized value and dependencies exist
    if (!currentComponent[memoPropName]) {
        currentComponent[memoPropName] = {
            dependencies: [],
            value: undefined,
        };
    }

    const hasChangedDependencies = !dependencies
        .every((dep, index) => dep === currentComponent[memoPropName].dependencies[index]);

    // If dependencies have changed or this is the first run, recalculate the memoized value
    if (hasChangedDependencies) {
        currentComponent[memoPropName].value = calculation();
        currentComponent[memoPropName].dependencies = dependencies;
    }

    return currentComponent[memoPropName].value;
}