<template>
  <button
    :class="[styles, buttonSelector]"
    :alt="alt || text"
    :disabled="disabled || loading"
    type="submit"
    :size="size"
    :title="buttonTitle"
    :data-cy="buttonSelector"
    @click.prevent="performAction"
  >
    <font-awesome-icon
      v-if="loading || showSpinner"
      size="sm"
      icon="spinner"
      spin
    />
    <font-awesome-icon v-if="icon" class="m-1" :icon="icon" :size="iconSize" />
    <ccu-icon v-if="ccuIcon" class="m-1" :type="ccuIcon" :size="iconSize" />
    <slot>{{ text }}</slot>
    <font-awesome-icon v-if="suffixIcon" class="m-1" :icon="suffixIcon" />
  </button>
</template>

<script>
import { kebabCase } from 'lodash';
import VueTypes from 'vue-types';
import { BUTTON_VARIANTS as VARIANTS, ICON_SIZES, ICONS } from '@/constants';
import { EventsMixin } from '@/mixins';

export default {
  name: 'BaseButton',
  mixins: [EventsMixin],
  props: {
    action: VueTypes.func,
    disabled: VueTypes.bool.def(false),
    showSpinner: VueTypes.bool.def(false),
    text: VueTypes.string,
    alt: VueTypes.string.def('button'),
    title: VueTypes.string.def('Button'),
    size: VueTypes.oneOf(['small', 'medium', 'large', 'sm', 'md', 'lg']),
    icon: VueTypes.string,
    ccuIcon: VueTypes.oneOf(Object.values(ICONS)),
    iconSize: VueTypes.oneOf(ICON_SIZES).def('sm'),
    suffixIcon: VueTypes.oneOf(Object.values(ICONS)),
    selector: VueTypes.string,
    variant: VueTypes.oneOf(Object.values(VARIANTS)),
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    buttonSelector() {
      return this.selector || `js-${kebabCase(this.buttonTitle)}`;
    },
    buttonTitle() {
      return this.text || this.alt || this.title;
    },
    styles() {
      const styles = {
        'large text-h3 font-h3': ['large', 'lg'].includes(this.size),
        'medium text-sans text-h4 font-h4': ['medium', 'md'].includes(
          this.size,
        ),
        'small text-bodysm font-bodysm': ['small', 'sm'].includes(this.size),
        disabled: this.disabled,
        // **** DEPRECATED ****
        primary: this.type === 'primary',
        danger: this.type === 'danger',
        warning: this.type === 'warning',
        link: this.type === 'link',
        bare: this.type === 'bare',
        // **************
        flex: true,
        'items-center': true,
        'justify-center': true,
        'base-button': true,
      };
      if (this.variant) {
        styles[this.variant] = true;
      }
      styles[this.variant] = true;
      return styles;
    },
  },
  methods: {
    async performAction() {
      this.loading = true;

      try {
        if (this.action) {
          await this.action();
        }
      } catch (e) {
        // TODO: expose method for handling button exceptions
      } finally {
        this.logEvent();
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
button {
  @apply font-sans;
  cursor: pointer;
  outline: 0;
  transition: all 300ms ease;
}
button:focus {
  outline: 0;
}

/** ----- DEPRECATED ----- */
.primary {
  @apply bg-primary-light;
}
.link {
  @apply text-primary-dark;
}
/** ----- DEPRECATED ----- */

button.solid {
  @apply bg-primary-light;
}

button.solid:hover {
  @apply bg-crisiscleanup-yellow-100;
}

button.solid.disabled {
  @apply bg-crisiscleanup-dark-200 !important;
  @apply text-gray-100;
}

button.outline {
  background-color: transparent;
  border: 1px solid black;
}

button.outline:hover {
  @apply bg-crisiscleanup-dark-500;
  @apply text-gray-100;
}

button.outline.disabled {
  @apply text-crisiscleanup-grey-900;
}

button.outline.disabled:hover {
  @apply text-crisiscleanup-grey-900;
}

button.text {
  background-color: transparent;
}

button.text:hover {
  @apply bg-crisiscleanup-grey-100;
}

button.text.disabled {
  @apply text-crisiscleanup-grey-900;
}

button.text.disabled:hover {
  @apply text-crisiscleanup-grey-900;
}

button.small {
  min-height: 24px;
  padding-left: 15px;
  padding-right: 15px;
}

button.medium {
  min-height: 32px;
  padding-left: 20px;
  padding-right: 20px;
}

button.large {
  min-height: 50px;
  padding-left: 34px;
  padding-right: 34px;
}
</style>
