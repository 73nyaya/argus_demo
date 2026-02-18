/**
 * Quantity Color Bar Module
 * Displays a vertical gradient color bar with value indicators
 * Shows current selected element's value with a marker
 */

class QuantityColorBar {
    constructor({ title, max, min, numberOfSpots = 6, containerId }) {
        this.title = title || 'Value';
        this.max = max || 100;
        this.min = min || 0;
        this.numberOfSpots = numberOfSpots;
        this.containerId = containerId;
        this.currentValue = null;
        
        // Color gradient: red (high) to blue (low)
        this.colorGradientString = 'to bottom, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%)';
        
        // Create magnitude array for value labels
        this.magnitudeArray = [];
        for (let i = 0; i <= numberOfSpots; i++) {
            const percentage = i / numberOfSpots;
            const value = this.min + (this.max - this.min) * (1 - percentage);
            this.magnitudeArray.push({
                percentage: percentage,
                value: value.toFixed(2)
            });
        }
        
        this.dom = this.createMainDOM();
    }
    
    createMainDOM() {
        const container = document.createElement('div');
        container.className = 'quantityColorBar';
        container.style.paddingLeft = '40px';
        container.style.width = '10%';
        container.style.minWidth = '120px';
        
        // Title row
        const titleRow = document.createElement('div');
        titleRow.style.fontSize = 'small';
        titleRow.innerHTML = `<span>${this.title}</span>`;
        container.appendChild(titleRow);
        
        // Bar container
        const barContainer = document.createElement('div');
        barContainer.className = 'barContainer';
        barContainer.style.height = '450px';
        barContainer.style.position = 'relative';
        this.barHeight = 450;
        
        // Color bar
        const colorBar = document.createElement('div');
        colorBar.className = 'colorBar';
        colorBar.style.backgroundImage = `linear-gradient(${this.colorGradientString})`;
        colorBar.style.height = '100%';
        colorBar.style.width = '40px';
        colorBar.style.position = 'relative';
        colorBar.style.border = '1px solid #ccc';
        colorBar.style.borderRadius = '4px';
        
        // Value labels container
        const labelsContainer = document.createElement('div');
        labelsContainer.style.position = 'absolute';
        labelsContainer.style.left = '50px';
        labelsContainer.style.top = '0';
        labelsContainer.style.height = '100%';
        labelsContainer.style.width = '60px';
        
        // Add value labels
        this.magnitudeArray.forEach((elem) => {
            const label = document.createElement('span');
            label.style.position = 'absolute';
            label.style.fontSize = 'small';
            label.style.top = `${(1 - elem.percentage) * 100}%`;
            label.style.transform = 'translateY(-50%)';
            label.innerHTML = elem.value;
            labelsContainer.appendChild(label);
        });
        
        barContainer.appendChild(colorBar);
        barContainer.appendChild(labelsContainer);
        container.appendChild(barContainer);
        
        return container;
    }
    
    /**
     * Update the current measure indicator
     */
    changeCurrentMeasure({ data }) {
        if (!data) {
            this.removeMeasure();
            return;
        }
        
        // Get the value from data
        let value;
        if (data['Value'] !== undefined) {
            value = data['Value'];
        } else {
            // Find first numeric value that's not 'Id'
            const keys = Object.keys(data);
            for (const key of keys) {
                if (key !== 'Id' && typeof data[key] === 'number') {
                    value = data[key];
                    break;
                }
            }
        }
        
        if (value === undefined || value === null) {
            this.removeMeasure();
            return;
        }
        
        this.currentValue = value;
        this.updateMeasureIndicator(value);
    }
    
    /**
     * Update the measure indicator on the color bar
     */
    updateMeasureIndicator(value) {
        const colorBar = this.dom.querySelector('.colorBar');
        if (!colorBar) return;
        
        // Remove existing measure indicator
        const existingMeasure = colorBar.querySelector('.measure');
        if (existingMeasure) {
            existingMeasure.remove();
        }
        
        // Calculate position (0% = max at top, 100% = min at bottom)
        const normalizedValue = (this.max - value) / (this.max - this.min);
        const topPosition = normalizedValue * 100;
        
        // Create measure indicator
        const measure = document.createElement('div');
        measure.className = 'measure';
        measure.style.position = 'absolute';
        measure.style.top = `calc(${topPosition}% - 15px)`;
        measure.style.background = 'black';
        measure.style.color = 'white';
        measure.style.textAlign = 'center';
        measure.style.width = '45px';
        measure.style.left = 'calc(100% + 5px)';
        measure.style.padding = '2px 4px';
        measure.style.borderRadius = '3px';
        measure.style.fontSize = 'small';
        measure.style.zIndex = '10';
        measure.innerHTML = `<span>${value.toFixed(2)}</span>`;
        
        // Add arrow pointing to bar
        const arrow = document.createElement('div');
        arrow.style.position = 'absolute';
        arrow.style.left = '-5px';
        arrow.style.top = '50%';
        arrow.style.transform = 'translateY(-50%)';
        arrow.style.width = '0';
        arrow.style.height = '0';
        arrow.style.borderTop = '5px solid transparent';
        arrow.style.borderBottom = '5px solid transparent';
        arrow.style.borderRight = '5px solid black';
        measure.appendChild(arrow);
        
        colorBar.appendChild(measure);
    }
    
    /**
     * Remove the measure indicator
     */
    removeMeasure() {
        const colorBar = this.dom.querySelector('.colorBar');
        if (colorBar) {
            const measure = colorBar.querySelector('.measure');
            if (measure) {
                measure.remove();
            }
        }
        this.currentValue = null;
    }
    
    /**
     * Update min/max values and regenerate labels
     */
    updateRange(min, max) {
        this.min = min;
        this.max = max;
        
        // Regenerate magnitude array
        this.magnitudeArray = [];
        for (let i = 0; i <= this.numberOfSpots; i++) {
            const percentage = i / this.numberOfSpots;
            const value = this.min + (this.max - this.min) * (1 - percentage);
            this.magnitudeArray.push({
                percentage: percentage,
                value: value.toFixed(2)
            });
        }
        
        // Update labels
        const labelsContainer = this.dom.querySelector('.barContainer > div:last-child');
        if (labelsContainer) {
            labelsContainer.innerHTML = '';
            this.magnitudeArray.forEach((elem) => {
                const label = document.createElement('span');
                label.style.position = 'absolute';
                label.style.fontSize = 'small';
                label.style.top = `${(1 - elem.percentage) * 100}%`;
                label.style.transform = 'translateY(-50%)';
                label.innerHTML = elem.value;
                labelsContainer.appendChild(label);
            });
        }
        
        // Update current measure if exists
        if (this.currentValue !== null) {
            this.updateMeasureIndicator(this.currentValue);
        }
    }
    
    /**
     * Remove the DOM element
     */
    remove() {
        if (this.dom && this.dom.parentNode) {
            this.dom.parentNode.removeChild(this.dom);
        }
    }
}

// Export for use in other modules
window.QuantityColorBar = QuantityColorBar;
