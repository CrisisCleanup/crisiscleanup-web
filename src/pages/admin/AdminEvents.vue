<template>
  <div class="events__container">
    <div class="events__header">
      <base-text variant="h1" bold>
        {{ $t('~~Event Management') }}
      </base-text>
    </div>
    <div class="events__body">
      <div class="events__search">
        <TitledCard class="search__card" title="~~Event Search">
          <div class="search__container">
            <EventSearchTable />
          </div>
        </TitledCard>
      </div>
      <div class="events__build">
        <TitledCard class="build__input" title="~~Event Builder">
          <EventForm @update:inputs="(payload) => onEventInput(payload)" />
        </TitledCard>
        <TitledCard class="build__preview" title="~~Preview"> </TitledCard>
      </div>
    </div>
  </div>
</template>

<script>
import EventSearchTable from '@/components/admin/events/EventSearchTable.vue';
import TitledCard from '@/components/cards/TitledCard.vue';
import EventForm from '@/components/admin/events/EventForm.vue';
import { ref } from '@vue/composition-api';

export default {
  name: 'AdminEvents',
  components: { EventSearchTable, TitledCard, EventForm },
  setup() {
    const eventInputs = ref({});
    const onEventInput = (inputs) => {
      eventInputs.value = inputs;
    };
    return {
      eventInputs,
      onEventInput,
    };
  },
};
</script>

<style scoped lang="postcss">
.events {
  &__container {
    lost-utility: clearfix;
    @apply h-full w-full bg-crisiscleanup-light-grey p-6;
  }
  &__header {
    lost-row: 1/22;
  }
  &__body {
    > div {
      lost-row: 1/2;
    }
  }
  &__build {
    > div {
      lost-column: 1/2;
    }
  }
}

.search {
  &__container {
    @apply h-full w-full m-6;
  }
}
</style>